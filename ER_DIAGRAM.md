# ER Diagram — How to create one for this project

This project uses a MySQL database (`mentorship_db`) with these main tables: `users`, `students`, `mentors`, `parents`, `assignments`, `meetings`, `goals`, `meeting_notes`, `general_notes`, `interventions`.

This document explains several practical ways to generate an ER (entity-relationship) diagram from the schema: GUI tools, automated generators, and a quick manual method using `dbdiagram.io` (DBML). Pick the method that suits you.

---

## Recommended quick approach (web): dbdiagram.io

- Pros: Fast, easy to edit, shareable, no install required. Good for clean diagrams.
- Cons: Manual (you must provide DBML) or paste a simplified schema.

Steps:
1. Open https://dbdiagram.io/ and create a free account (optional).
2. Click **New Diagram** and paste DBML (Database Markup Language) into the editor.
3. Export PNG/SVG from the UI or share the diagram link.

Sample DBML you can paste (adapt to your actual columns):

```
Table users {
  user_id int [pk]
  email varchar
  password varchar
  role varchar
}

Table students {
  student_id int [pk]
  user_id int [ref: > users.user_id]
  name varchar
  roll_number varchar
}

Table mentors {
  mentor_id int [pk]
  user_id int [ref: > users.user_id]
  name varchar
}

Table parents {
  parent_id int [pk]
  user_id int [ref: > users.user_id]
  name varchar
  email varchar
  phone varchar
  relation varchar
}

Table assignments {
  assignment_id int [pk]
  mentor_id int [ref: > mentors.mentor_id]
  student_id int [ref: > students.student_id]
  start_date date
  status varchar
}

Table meetings {
  meeting_id int [pk]
  assignment_id int [ref: > assignments.assignment_id]
  mentor_id int [ref: > mentors.mentor_id]
  student_id int [ref: > students.student_id]
  meeting_date date
}

Table goals {
  goal_id int [pk]
  assignment_id int [ref: > assignments.assignment_id]
  mentor_id int [ref: > mentors.mentor_id]
  student_id int [ref: > students.student_id]
  goal_title varchar
  status varchar
}

Table meeting_notes {
  note_id int [pk]
  meeting_id int [ref: > meetings.meeting_id]
  mentor_id int [ref: > mentors.mentor_id]
  student_id int [ref: > students.student_id]
  note_content text
}

Table general_notes {
  general_note_id int [pk]
  assignment_id int [ref: > assignments.assignment_id]
  mentor_id int [ref: > mentors.mentor_id]
  student_id int [ref: > students.student_id]
  note_content text
}

Table interventions {
  intervention_id int [pk]
  assignment_id int [ref: > assignments.assignment_id]
  mentor_id int [ref: > mentors.mentor_id]
  student_id int [ref: > students.student_id]
  action_date date
}

// you can adjust column types, add indexes and notes as needed
```

After pasting the DBML, adjust names/types and export a PNG or SVG to `docs/` in this repo (create `docs/er-diagram.png`).

---

## GUI method: MySQL Workbench (reverse engineer)

- Pros: Fully automated, shows FK arrows and cardinality, good for complex schemas.
- Cons: Requires installing MySQL Workbench.

Steps:
1. Export or ensure your DB is reachable from the machine: the DB must be accessible by the Workbench client.
2. Open MySQL Workbench → Database → Reverse Engineer.
3. Follow the wizard: connect to your `mentorship_db` database, select the schema objects (tables) and finish.
4. MySQL Workbench will show an EER diagram. Use **Arrange → Auto Layout** to tidy.
5. Export: File → Export → Export as PNG/SVG or print to PDF.
6. Save the exported image into the repo: `docs/er-diagram.png`.

Tip: If you only have `schema.sql`, import it into a local MySQL instance first:

```powershell
mysql -u root -p < database/schema.sql
```

---

## GUI method: DBeaver (reverse engineer / ER Diagrams)

- Pros: Multi-platform, supports many DBs, generates ER diagrams quickly.

Steps:
1. Install DBeaver (Community edition).
2. Create a connection to your MySQL server and open the `mentorship_db` schema.
3. Right-click a schema or a table → **ER Diagram** → **Create New ER Diagram**.
4. Use Save/Export to PNG or SVG.

---

## Automated generator: SchemaSpy

- Pros: Generates browsable HTML documentation (includes ER diagrams via Graphviz).
- Cons: Requires Java and Graphviz.

Install prerequisites:

1. Download `schemaspy` jar and the MySQL JDBC driver (Connector/J).
2. Install Graphviz (so SchemaSpy can render diagrams).

Run (example):

```powershell
# example - adapt paths, user, password
java -jar schemaspy.jar -t mysql -dp "./mysql-connector-java.jar" -db mentorship_db -host localhost -u root -p yourpassword -o ./docs/schemaspy
```

Open the generated `docs/schemaspy/index.html` to view diagrams and documentation. You can export images from the HTML output.

---

## Quick automated approach: generate DBML from SQL (semi-automated)

If you have `schema.sql`, some tools/scripts can convert SQL to DBML. A simple way:

1. Dump schema only (no data):
```powershell
mysqldump -u root -p --no-data mentorship_db > schema-only.sql
```
2. Use online converters (search "sql to dbml converter") or manually craft the DBML using the sample above.

---

## Tips for a clear ER diagram
- Show primary keys (PK) and foreign keys (FK) clearly.
- Group related tables (assignments → meetings, goals, notes, interventions).
- Annotate relationship cardinality if useful (1..*, 0..1).
- Export an SVG if you want a vector image for slides or printing.

---

## Suggested file locations in this repository
- Add exported images under `docs/er-diagram.png` or `docs/er-diagram.svg`.
- Add this file (`ER_DIAGRAM.md`) to the repo root (you are reading it now).

---

If you want, I can:
- Generate a DBML file automatically from `database/schema.sql` (I can parse it and create a first-draft DBML in `database/schema.dbml`).
- Create an exported SVG/PNG if you provide DB credentials so I can run SchemaSpy locally (I cannot run on your machine but I can provide exact commands and scripts).

Tell me which method you prefer and I will produce the next artifact (DBML file or step-by-step script) in the repo.
