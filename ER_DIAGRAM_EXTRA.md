# ER Diagram, Relational Schema & Normalization (1NF, 2NF, 3NF)

This companion file gives step-by-step guidance for creating a correct ER diagram, mapping it to a relational schema, and normalizing to 1NF → 2NF → 3NF with concrete examples tailored to a mentorship system.

## 1) Create a correct ER diagram (practical steps)
- Read the requirements and list nouns → candidate entities (User, Student, Mentor, Parent, Assignment, Meeting, Goal, Note, Intervention, Program, etc.).
- For each entity, list attributes and select a primary key (PK). Prefer surrogate integer PKs (`*_id`).
- Identify relationships and cardinality (1:1, 1:N, M:N) and optionality (0..1, 1..*).
- For M:N relationships create associative entities (junction tables) and show any attributes of the relationship there.
- Mark FKs and annotate relationship direction and multiplicity on the diagram.
- Keep it readable: group related entities, reduce crossed edges, or split large domains into sub-diagrams.

## 2) Map ER to relational schema (rules)
1. Each entity → table with PK.
2. 1:N relationship (A 1 : N B) → put A.pk as FK in B.
3. M:N relationship → create join table (A_B) with FKs to A and B; include relationship attributes there.
4. 1:1 relationship → put FK on the optional side or merge if tightly coupled.
5. Relationship attributes → put them on the join table or on the child table representing the relationship.

Example mapping:
```
students(student_id PK, user_id FK, name, roll_number, phone, program_id FK, year)
mentors(mentor_id PK, user_id FK, name, email)
assignments(assignment_id PK, student_id FK, mentor_id FK, start_date, status)
meetings(meeting_id PK, assignment_id FK, mentor_id FK, student_id FK, meeting_time, duration_minutes, status)
```

## 3) Normalization — short how-to and example

### 1NF (First Normal Form)
- Requirement: each column must be atomic; no repeating groups or arrays.
- Action: if a column contains multiple values (CSV or array), split into child rows or create a join table.

### 2NF (Second Normal Form)
- Requirement: table is in 1NF and every non-key attribute must depend on the whole primary key (no partial dependencies).
- Action: if you have composite PKs, ensure attributes depend on the full composite key; otherwise move attributes that depend only on part of the key to separate tables.

### 3NF (Third Normal Form)
- Requirement: table is in 2NF and no non-key attribute should depend transitively on the PK.
- Action: if A -> B and B -> C, and C is stored in the same table keyed by A, instead move C into a table keyed by B and reference B by FK.

### Worked example (denormalized → 1NF → 2NF → 3NF)
Denormalized table (bad):
```
student_full(
  student_id,
  name,
  roll_number,
  program_name,
  mentor_name,
  mentor_email,
  parent_name,
  parent_email
)
```
Problems:
- Mentor and parent data repeated across students.
- `program_name` better lives in a program lookup table.

Apply 1NF:
- Ensure columns are atomic (they are), and move repeated entities into separate tables:
```
students(student_id PK, name, roll_number, program_id FK, phone, year)
programs(program_id PK, program_name)
mentors(mentor_id PK, name, email)
parents(parent_id PK, name, email, phone)
```

Apply 2NF:
- If any table had composite keys, remove partial dependencies. For our design we already use surrogate PKs, so ensure non-key attributes belong to the table keyed by that PK (e.g., `program_name` must not be stored on `students`).

Apply 3NF:
- Remove transitive dependencies. Example: do not store `program_name` on `students`; keep it in `programs` and reference via `program_id`.

Final normalized schema (example):
```
users(user_id PK, email UNIQUE, password_hash, role)
programs(program_id PK, program_name)
students(student_id PK, user_id FK, name, roll_number UNIQUE, program_id FK, phone, year)
mentors(mentor_id PK, user_id FK, name, department, availability)
parents(parent_id PK, user_id FK, name, phone, relation)
assignments(assignment_id PK, student_id FK, mentor_id FK, start_date, end_date, status)
meetings(meeting_id PK, assignment_id FK, meeting_time, duration_minutes, status, requested_by_user_id)
goals(goal_id PK, assignment_id FK, title, description, status, target_date)
meeting_notes(note_id PK, meeting_id FK, author_id FK, content, created_at)
```

## 4) Verification checklist (are you in 3NF?)
- No multi-valued columns (1NF).
- No partial dependencies on part of a composite key (2NF).
- No transitive dependencies where a non-key depends on another non-key (3NF).
- Useful constraints: `UNIQUE` on natural keys (email, roll_number), `NOT NULL` where required, and FK constraints with indexes.

## 5) Practical tips
- Use surrogate keys for simplicity and unique business keys for constraints.
- For audit: add `created_at`, `updated_at`, and `created_by` FK when helpful.
- For fast prototyping use `dbdiagram.io` DBML; for production documentation use SchemaSpy or reverse-engineer with MySQL Workbench.

## 6) Next steps I can take for you
- Produce a `database/schema.dbml` from `database/schema.sql` in this repo.
- Create an `docs/er-diagram.svg` exported from DBML or SchemaSpy.

Tell me which of the above you'd like me to generate automatically and I'll add it to the repository.
