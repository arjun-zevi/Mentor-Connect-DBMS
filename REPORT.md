# Project Report - Student Mentorship System

**Project:** Student Mentorship System

**Authors / Team:** Project repository owner

**Date:** 2025-11-27

---

**Abstract**

This Student Mentorship System is a web application built to help educational institutions manage mentor–mentee relationships. It provides role-based access (admin, mentor, student), supports assignment of students to mentors, scheduling and tracking of meetings, setting and monitoring goals, recording meeting notes and general notes, and tracking interventions. The system uses a Node.js + Express backend, a MySQL relational database, and a React frontend.

---

**Objectives**
- Provide a lightweight mentorship management system for admins, mentors, and students.
- Track mentor–mentee assignments, meetings, goals, notes, and interventions.
- Provide role-based API access and a simple, responsive UI for key workflows.
- Produce clear reports and metrics to help mentors monitor their mentees.

---

**Technologies & Tools**
- Backend: Node.js, Express
- Database: MySQL (schema in `database/schema.sql`)
- Frontend: React, React Router, Axios
- Authentication: JWT tokens (stateless sessions)
- Dev tools / scripts: `mysql`, `mysqldump`, `dbdiagram.io` (or MySQL Workbench / DBeaver / SchemaSpy for ER diagrams)
- Project structure: `backend/`, `frontend/`, `database/`, documentation files at repo root

---

**System Architecture**

- Client (React) communicates with RESTful backend (`/api/*`) using JSON over HTTP.
- Backend authenticates requests using JWTs; route middleware enforces role-based access (`verifyToken`, `verifyMentor`, `verifyStudent`).
- Backend executes SQL queries using a MySQL promise pool (`backend/config/database.js`) and returns JSON responses.

---

**Database Summary**

Key tables (see `database/schema.sql` for full DDL):
- `users` — stores all users with `user_id`, `email`, `password` (plain text in this implementation), and `role` (`admin|mentor|student`).
- `mentors` — mentor profile rows linked to `users` via `user_id`.
- `students` — student profile rows linked to `users` via `user_id`.
- `assignments` — mentor↔student relationships; `assignment_id` is referenced by meetings, goals, notes, and interventions.
- `meetings` — scheduled meetings (with `meeting_date`, `meeting_time`, `mode`, `status`).
- `goals` — mentor-set goals for students with `status` and `target_date`.
- `meeting_notes` and `general_notes` — notes associated with meetings or general feedback.
- `interventions` — records of interventions taken for students.

Notes on keys and constraints:
- Relationships enforced by FOREIGN KEY constraints: e.g., `meetings.assignment_id -> assignments.assignment_id`.
- `assignments` uniquely link a `mentor_id` and `student_id` (unique constraint), and have `status` (active/inactive/completed).

ER Diagram (recommended): Use `ER_DIAGRAM.md` (in this repo) as a DBML starting point or generate via MySQL Workbench / dbdiagram.io.

---

**API Endpoints (overview)**

Auth:
- `POST /api/auth/login` — login, returns JWT + user payload
- `POST /api/auth/register-student` — create student (admin)
- `POST /api/auth/register-mentor` — create mentor (admin)

Mentor / Assignments:
- `GET /api/mentors/mentees` — list assigned mentees
- `POST /api/mentors/assign` — create assignment (mentor)
- `GET /api/mentors/students/all` — list all students + active assignment (mentor view)

Meetings:
- `POST /api/meetings` — create a meeting (mentor). The backend validates or creates a matching assignment if needed.
- `GET /api/meetings/upcoming` — mentor upcoming meetings (status = scheduled)
- `GET /api/meetings/overdue/list` — mentor overdue meetings (past date OR status in done/missed/cancelled)
- `PUT /api/meetings/:meeting_id` — update meeting status (mentor)
- `GET /api/meetings/details/:meeting_id` — meeting details (mentor)
- `GET /api/meetings/student/upcoming` — student upcoming meetings
- `GET /api/meetings/student/me` — all meetings for logged-in student

Goals:
- `POST /api/goals` — create goal (mentor)
- `GET /api/goals/student/me` — student goals
- `PUT /api/goals/:goal_id` — update goal (mentor)
- `GET /api/goals/active/all` — mentor active (open/in-progress) goals
- `GET /api/goals/all` — mentor all goals (added to support filtering)

Notes:
- `POST /api/notes` — add meeting note (mentor)
- `GET /api/notes/meeting/:meeting_id` — get meeting notes (mentor or that meeting's student)
- `POST /api/notes/general/add` — add general note (mentor)
- `GET /api/notes/meeting/student/:student_id` — get meeting notes for a student (mentor sees only their students; student sees their own)

Interventions:
- `POST /api/interventions` — create intervention (mentor)
- `GET /api/interventions/student/:student_id` — get interventions for a student (mentor)

Reports:
- `GET /api/reports/dashboard-stats` — aggregate dashboard numbers
- `GET /api/reports/at-risk-students` — returns students with non-completed goals for a mentor

---

**Frontend Pages (high-level)**
- `Login` — authentication page.
- `MentorDashboard` — mentor overview + quick stats.
- `MentorMentees` — list and manage mentees; includes assignment creation.
- `MentorMeetings` — manage meetings (schedule, update status, add notes).
- `ScheduleMeeting` — schedule for a specific student; frontend now fetches assignment or lets mentor create assignment inline.
- `MentorGoals`, `MentorSetGoal` — manage goals; filtering by status implemented.
- `StudentDashboard`, `StudentMeetings`, `StudentGoals` — student views.
- `AddNotes` — mentor adds meeting notes (auto-fills student_id from meeting) and student can view notes via `My Notes`.

---

**UI / UX Enhancements**
- The frontend uses plain CSS under `frontend/src/styles`. For a more polished UI you can integrate a UI library (e.g., Material-UI / Chakra UI / Bootstrap) and add consistent colors, icons, and responsive layout.
- Example changes already added in this repo: auto-fill behavior for meeting notes, assignment creation helper in the schedule page, and improved filtering for goals.

---

**Setup & Run Instructions**

Prerequisites:
- Node.js (14+), npm
- MySQL server

Database setup (local):
1. Create the database and tables using the schema file:

```powershell
mysql -u <user> -p < database/schema.sql
```

2. (Optional) Import sample data if provided or run `insert_test_data.js` where available in `backend/`.

Backend:

```powershell
cd backend
npm install
npm start
```

Frontend:

```powershell
cd frontend
npm install
npm start
```

Notes: Ensure backend is reachable at `http://localhost:5000` (default). Frontend expects the API on `http://localhost:5000/api`.

Helper scripts (backend):
- `backend/scripts/create_admin.js` — create or update an admin user
- `backend/scripts/find_or_create_assignment_and_schedule.js` — helper to find or create an assignment and schedule a meeting in one step

---

**Testing & Sample Data**

- There are test scripts in `backend/` used for manual testing, for example `test_post_meeting.js` which constructs a mentor JWT and posts a meeting request.
- Use `backend/test_student_data.js` to inspect student-specific data (meetings, goals) when available.
- Manual test cases to run:
  - Login as mentor, create an assignment for a student, schedule a meeting, verify it appears in student upcoming.
  - Mark meeting done/missed/cancelled and verify it moves from Upcoming to Overdue.
  - Create a goal and mark it completed from the student side and verify mentor reports change.

---

**Results & Observations**

- Role-based access control is enforced by middleware; earlier route ordering issues (e.g., `/student/me` vs `/student/:student_id`) were fixed.
- Meeting scheduling: server now validates `assignment_id`; when missing or not found it will create an assignment (if student has no active assignment or it belongs to the same mentor) to avoid FK constraint errors.
- Overdue/Upcoming handling: upcoming endpoints now return only `scheduled` meetings; overdue list shows past meetings or meetings with status `done|missed|cancelled` to reflect status changes immediately.
- Notes: mentor Add Notes form auto-fills the student id from meeting details and students can view notes in `My Notes`.

---

**Known Issues & Limitations**

- Passwords are stored and compared as plain text in the current implementation. This is insecure for production. Migrate to a secure password hashing scheme (e.g., bcrypt) and enforce HTTPS in deployment.
- No transactional or optimistic concurrency controls in some multi-step flows (e.g., create assignment + insert meeting) — consider transactions where appropriate.
- No file attachments for notes/meetings (could be added).
- No email notifications or real-time updates (WebSockets) — status requires polling/refresh.

---

**Future Work & Recommendations**

Short-term improvements:
- Migrate to hashed passwords with `bcrypt` and add a password reset flow.
- Add input validation at both frontend and backend (e.g., date/time, durations, enums).
- Improve UI by adopting a component library and consistent theme; add icons and responsive layout.

Medium-term features:
- Email/SMS notifications for scheduled meetings and reminders.
- Real-time indicators (WebSocket) for meeting updates.
- Advanced reporting: students at risk by combining overdue goals, low meeting frequency, and academic status.

Long-term / scaling:
- Add pagination and search for large data sets.
- Move to a managed database and add backup/restore scripts.
- Add end-to-end tests and CI workflows.

---

**Appendices**

- Files of interest:
  - `database/schema.sql` — full schema DDL
  - `backend/routes/*.js` — API implementation
  - `frontend/src/pages/*` — React pages
  - `ER_DIAGRAM.md` — DBML sample and instructions to create an ER diagram
  - `PROJECT_OUTLINE.md`, `README.md`, `COMPLETION_REPORT.md` — other project docs

- How to generate an ER diagram quickly: open `ER_DIAGRAM.md` and paste the DBML into https://dbdiagram.io/ and export as PNG/SVG.

---

If you want, I can also:
- Generate `database/schema.dbml` (DBML file) automatically from `database/schema.sql` and add it to the repo.
- Produce an exportable SVG/PNG ER diagram if you provide DB access (or run SchemaSpy locally and paste the output here).
- Create a one-page PowerPoint friendly summary or slide notes for your presentation.

End of report.
