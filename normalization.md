# Normalization / Denormalization Report

This file documents the current normalization status of the project (1NF, 2NF, 3NF) and demonstrates how to transform the normalized schema into a deliberately denormalized (non-normalized) form for reporting or analytics purposes. This file does not change the project code or database — it only documents how to produce denormalized structures if you choose to do so.

Important: DO NOT apply these denormalizing schema changes to your production OLTP schema without understanding trade-offs (redundancy, update anomalies, larger storage, and risk of inconsistency). These examples are for documentation, reporting, or read-optimized replicas only.

---

## 1. Current normalization status (brief)
- The project schema follows a normalized design:
  - `users` centralizes credentials and roles.
  - `students`, `mentors`, `parents` are profile tables referencing `users`.
  - `assignments` models the relationship between students and mentors.
  - `meetings`, `goals`, `meeting_notes`, `interventions` reference `assignments` (or students/mentors) so attributes belong to the correct entity.
- This design adheres to 1NF, 2NF, and 3NF: attributes are atomic, no partial dependencies on composite keys, and no transitive non-key dependencies.

## 2. Why you might denormalize (use cases)
- Reporting and analytics where many joins are expensive.
- Single large table simplifies reads for dashboards or ETL jobs.
- Precomputed views to reduce response time for aggregated queries.

Trade-offs:
- Increased redundancy (duplicate mentor/parent info per student row).
- Update anomalies: changing mentor email requires updating many rows.
- Larger storage and potential inconsistency unless you rebuild/refresh periodically.

---

## 3. Denormalized (non-normalized) schema examples
Below are several denormalized variants with SQL examples that show how you could produce flattened tables for reporting. These are examples only — do not run DDL on the production transactional schema unless you intentionally want to restructure it.

### 3.1 Flat student_profile_denorm (combine students, mentor, parent, program, assignment)
This table flattens student, assignment, mentor and parent into a single row per student-assignment.

Example CREATE (reporting table):

```sql
CREATE TABLE student_profile_denorm (
  denorm_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  student_name VARCHAR(255),
  student_email VARCHAR(255),
  roll_number VARCHAR(100),
  phone VARCHAR(50),
  program_name VARCHAR(255),
  year INT,

  assignment_id INT,
  assignment_start_date DATE,
  assignment_status VARCHAR(50),

  mentor_id INT,
  mentor_name VARCHAR(255),
  mentor_email VARCHAR(255),
  mentor_department VARCHAR(255),

  parent_id INT,
  parent_name VARCHAR(255),
  parent_email VARCHAR(255),
  parent_phone VARCHAR(50),
  parent_relation VARCHAR(100)
);
```

Populate from normalized tables (example SELECT into the denorm table):

```sql
INSERT INTO student_profile_denorm (
  student_id, student_name, student_email, roll_number, phone, program_name, year,
  assignment_id, assignment_start_date, assignment_status,
  mentor_id, mentor_name, mentor_email, mentor_department,
  parent_id, parent_name, parent_email, parent_phone, parent_relation
)
SELECT
  s.student_id,
  s.name,
  u.email AS student_email,
  s.roll_number,
  s.phone,
  p.program_name,
  s.year,
  a.assignment_id,
  a.start_date,
  a.status,
  m.mentor_id,
  m.name AS mentor_name,
  mu.email AS mentor_email,
  m.department,
  par.parent_id,
  par.name AS parent_name,
  paru.email AS parent_email,
  par.phone AS parent_phone,
  par.relation
FROM students s
LEFT JOIN users u ON s.user_id = u.user_id
LEFT JOIN programs p ON s.program_id = p.program_id
LEFT JOIN assignments a ON a.student_id = s.student_id
LEFT JOIN mentors m ON a.mentor_id = m.mentor_id
LEFT JOIN users mu ON m.user_id = mu.user_id
LEFT JOIN parents par ON s.parent_id = par.parent_id
LEFT JOIN users paru ON par.user_id = paru.user_id
;
```

Notes:
- If a student has multiple assignments, the student will appear multiple times (one row per assignment).
- Mentor and parent information (name, email) will be duplicated for each relevant student-assignment row.

### 3.2 Wide meetings denormalized table (include meeting and notes inline)
If you want a single row per meeting that includes student, mentor, and concatenated notes, you might create:

```sql
CREATE TABLE meetings_denorm (
  meeting_row_id INT AUTO_INCREMENT PRIMARY KEY,
  meeting_id INT,
  meeting_time DATETIME,
  duration_minutes INT,
  status VARCHAR(50),

  assignment_id INT,
  student_id INT,
  student_name VARCHAR(255),
  student_email VARCHAR(255),
  mentor_id INT,
  mentor_name VARCHAR(255),
  mentor_email VARCHAR(255),

  notes_concat TEXT -- e.g., aggregated meeting notes
);
```

Populate by aggregating notes into a single field (MySQL example using GROUP_CONCAT):

```sql
INSERT INTO meetings_denorm (
  meeting_id, meeting_time, duration_minutes, status,
  assignment_id, student_id, student_name, student_email,
  mentor_id, mentor_name, mentor_email,
  notes_concat
)
SELECT
  m.meeting_id,
  m.meeting_time,
  m.duration_minutes,
  m.status,
  m.assignment_id,
  s.student_id,
  s.name AS student_name,
  su.email AS student_email,
  mnt.mentor_id,
  ment.name AS mentor_name,
  mu.email AS mentor_email,
  GROUP_CONCAT(mn.content SEPARATOR '\n---\n') AS notes_concat
FROM meetings m
LEFT JOIN assignments a ON m.assignment_id = a.assignment_id
LEFT JOIN students s ON a.student_id = s.student_id
LEFT JOIN users su ON s.user_id = su.user_id
LEFT JOIN mentors ment ON a.mentor_id = ment.mentor_id
LEFT JOIN users mu ON ment.user_id = mu.user_id
LEFT JOIN meeting_notes mn ON mn.meeting_id = m.meeting_id
GROUP BY m.meeting_id;
```

### 3.3 Single big table (very denormalized)
For a simple but highly denormalized design you might create a single table containing many repeated groups: `system_flat` that contains student, mentor, parent, the last meeting date, last goal, etc. This is generally discouraged for OLTP but sometimes used for BI snapshots.

Example (conceptual columns only):

```
system_flat(
  student_id, student_name, student_email, roll_number,
  mentor_name, mentor_email, mentor_department,
  parent_name, parent_email,
  last_meeting_time, last_meeting_status,
  current_goal_title, current_goal_status
)
```

This table intentionally repeats data and combines unrelated attributes — use it only for read-only reporting or export.

---

## 3.4 Per-normal-form examples (Unnormalized → 1NF → 2NF → 3NF)

This section shows a compact worked example for each normal form. For each step I present a short "unnormalized" table (what you might start with in a quick prototype or spreadsheet) and then show the normalized structure for that form.

Note: these examples reuse a simple mentorship-focused record containing student, mentor, parent, program and assignment data.

A. Unnormalized starting table (example)

```
student_raw(
  record_id,
  student_name,
  emails,                 -- comma-separated emails (bad example of multi-valued column)
  roll_number,
  program,
  mentors,                -- repeated group: mentor1_name|mentor1_email;mentor2_name|mentor2_email
  parent_name,
  parent_email
)
```

This `student_raw` is intentionally messy: multi-valued `emails`, a `mentors` repeating group, etc.

1NF (First Normal Form)
- Problem addressed: remove repeating groups and ensure atomic columns.
- Action: explode multi-valued fields into separate rows or separate tables. Convert `mentors` repeating group into separate rows in a `student_mentor` mapping and store single email per row.

Unnormalized → 1NF result (example tables)

Unnormalized (source):
```
student_raw(record_id, student_name, emails, roll_number, program, mentors, parent_name, parent_email)
```

Normalized to 1NF (split repeating/multi-valued fields):

```
students(student_id PK, name, roll_number, program)
student_emails(email_id PK, student_id FK, email)
student_mentors(sm_id PK, student_id FK, mentor_name, mentor_email)
parents(parent_id PK, name, email)
```

Example SQL to transform (conceptual):

```sql
-- students inserted with one row per student
INSERT INTO students(name, roll_number, program)
SELECT DISTINCT student_name, roll_number, program FROM student_raw;

-- explode emails (pseudo-splitting CSV into rows depends on DB functions or app code)
-- assume a helper function SPLIT_STR returns rows
INSERT INTO student_emails(student_id, email)
SELECT s.student_id, email FROM students s
JOIN (SELECT record_id, SPLIT_STR(emails) AS email FROM student_raw) se ON se.record_id = s.record_id;

-- create student_mentors by parsing the mentors string and inserting one row per mentor
```

2NF (Second Normal Form)
- Problem addressed: remove partial dependencies when tables have composite keys.
- Example situation: suppose we had a table `assignment` with composite PK `(student_id, mentor_id)` and we stored `mentor_department` on it — `mentor_department` depends only on `mentor_id`, a part of the composite key.

Unnormalized (with partial dependency):

```
assignment_composite(student_id, mentor_id, mentor_department, assigned_on, student_program)
```

2NF result (move attributes to the correct table):

```
assignments(assignment_id PK, student_id FK, mentor_id FK, assigned_on)
mentors(mentor_id PK, name, department)
students(student_id PK, name, program)
```

Explanation: `mentor_department` moved to `mentors`; `student_program` belongs on `students` (not on assignment).

3NF (Third Normal Form)
- Problem addressed: remove transitive dependencies.
- Example transitive dependency: if `students` stored `program_name` directly, but `program_name` is a property of `programs` table, then `students.program_name` is transitively dependent on student → program_id → program_name.

Unnormalized/transitively dependent example:

```
students_bad(student_id, name, program_id, program_name)
```

3NF result (remove transitive dependency):

```
programs(program_id PK, program_name)
students(student_id PK, name, program_id FK)
```

SQL example to normalize to 3NF:

```sql
-- Create normalized programs table
INSERT INTO programs(program_id, program_name)
SELECT DISTINCT program_id, program_name FROM students_bad;

-- Rebuild students with FK to programs
INSERT INTO students(student_id, name, program_id)
SELECT student_id, name, program_id FROM students_bad;
```

Summary
- Start with messy, possibly multi-valued/duplicated rows.
- 1NF: make columns atomic and split repeating groups.
- 2NF: remove partial dependencies (move attributes off composite-key tables into single-entity tables).
- 3NF: remove transitive dependencies (factor out lookup/lookup tables).


## 4. How to produce denormalized data safely (recommended approach)
1. Create reporting tables or materialized views on a read-replica or separate reporting database.
2. Build ETL scripts (cron, Airflow, or scheduled Node/Python scripts) that refresh denormalized tables periodically.
3. If you need low-latency updates, consider incremental refreshes using change-data-capture or triggers that populate a reporting table when the normalized tables change.
4. Keep the transactional (normalized) schema as the source of truth; denormalized tables are read-only copies for reporting.

Example refresh script pseudo-steps:
- TRUNCATE `student_profile_denorm`;
- INSERT INTO `student_profile_denorm` SELECT ... (the join query shown above);
- ANALYZE/OPTIMIZE the table if needed; add indexes for common query patterns.

---

## 5. Re-normalizing (how to get back)
- If you need to reverse the denormalization, use the denormalized source to populate normalized tables using JOINs and deduplication steps (e.g., insert distinct mentors into `mentors`, map to their new `mentor_id`, then insert assignments and students using FK mapping tables).

---

## 6. Deliverable in this repo
- This file: `normalization.md` (you are reading it) — documents how to convert to denormalized forms without changing the project schema.

If you want, I can also:
- Generate the SQL script that creates the denormalized reporting tables and a scheduled Node.js script that refreshes them periodically in a separate reporting database.
- Produce a materialized view or a single-click SQL that writes denormalized CSV export for BI import.

Tell me which of the above you'd like next and I will add it to the repo (e.g., `scripts/refresh_denorm.sql` or `scripts/refresh_denorm.js`).