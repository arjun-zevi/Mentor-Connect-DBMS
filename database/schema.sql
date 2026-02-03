
-- STUDENT MENTORSHIP APP - DATABASE SCHEMA


-- Create Database
CREATE DATABASE IF NOT EXISTS mentorship_db;
USE mentorship_db;


-- 1. USERS TABLE (Admin, Mentors, Students)

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'mentor', 'student', 'parent') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- 2. STUDENTS TABLE

CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    parent_id INT,
    name VARCHAR(100) NOT NULL,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    program VARCHAR(100),
    year INT,
    academic_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


-- 3. MENTORS TABLE

CREATE TABLE mentors (
    mentor_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    availability VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


-- PARENTS TABLE
CREATE TABLE parents (
    parent_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    relation VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- add foreign key for students.parent_id to parents.parent_id
ALTER TABLE students
    ADD CONSTRAINT fk_student_parent FOREIGN KEY (parent_id) REFERENCES parents(parent_id) ON DELETE SET NULL;


-- 4. MENTOR-MENTEE ASSIGNMENT TABLE

CREATE TABLE assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    mentor_id INT NOT NULL,
    student_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mentor_id) REFERENCES mentors(mentor_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (mentor_id, student_id)
);


-- 5. MEETINGS TABLE

CREATE TABLE meetings (
    meeting_id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    mentor_id INT NOT NULL,
    student_id INT NOT NULL,
    meeting_date DATE NOT NULL,
    meeting_time TIME NOT NULL,
    duration INT,
    mode ENUM('online', 'offline') DEFAULT 'online',
    status ENUM('scheduled', 'done', 'missed', 'cancelled') DEFAULT 'scheduled',
    requested_by_user_id INT DEFAULT NULL,
    requested_by_role VARCHAR(50) DEFAULT NULL,
    requested_by_name VARCHAR(255) DEFAULT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(mentor_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    INDEX idx_meeting_date (meeting_date),
    INDEX idx_status (status)
);


-- 6. GOALS TABLE

CREATE TABLE goals (
    goal_id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    mentor_id INT NOT NULL,
    student_id INT NOT NULL,
    goal_title VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE,
    status ENUM('open', 'in-progress', 'completed', 'deferred') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(mentor_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_target_date (target_date)
);


-- 7. NOTES TABLE (Meeting Notes)

CREATE TABLE meeting_notes (
    note_id INT PRIMARY KEY AUTO_INCREMENT,
    meeting_id INT NOT NULL,
    mentor_id INT NOT NULL,
    student_id INT NOT NULL,
    note_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(meeting_id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(mentor_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- ============================================
-- 8. GENERAL NOTES TABLE (Student Feedback)
-- ============================================
/*CREATE TABLE general_notes (
    general_note_id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    mentor_id INT NOT NULL,
    student_id INT NOT NULL,
    note_type ENUM('behaviour', 'performance', 'attendance', 'other') DEFAULT 'other',
    note_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(mentor_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);*/

-- ============================================
-- 9. INTERVENTIONS TABLE
-- ============================================
/*CREATE TABLE interventions (
    intervention_id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    mentor_id INT NOT NULL,
    student_id INT NOT NULL,
    intervention_type ENUM('counseling', 'tutoring', 'parental_meeting', 'other') DEFAULT 'other',
    description TEXT,
    action_date DATE NOT NULL,
    outcome VARCHAR(255),
    status ENUM('pending', 'completed', 'ongoing') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(mentor_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_action_date (action_date)
);*/

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_mentor_assignments ON assignments(mentor_id);
CREATE INDEX idx_student_assignments ON assignments(student_id);
CREATE INDEX idx_mentor_meetings ON meetings(mentor_id);
CREATE INDEX idx_student_meetings ON meetings(student_id);
CREATE INDEX idx_mentor_goals ON goals(mentor_id);
CREATE INDEX idx_student_goals ON goals(student_id);

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Insert sample admin user
/*INSERT INTO users (email, password, role) VALUES ('admin@mentorship.com', 'admin123', 'admin');

-- Insert sample mentors
INSERT INTO users (email, password, role) VALUES ('mentor1@college.com', 'mentor123', 'mentor');
INSERT INTO users (email, password, role) VALUES ('mentor2@college.com', 'mentor123', 'mentor');

INSERT INTO mentors (user_id, name, email, department, availability) VALUES 
(2, 'Dr. Amit Kumar', 'mentor1@college.com', 'Computer Science', 'Mon-Fri 2-4 PM'),
(3, 'Dr. Priya Singh', 'mentor2@college.com', 'Information Technology', 'Tue-Thu 3-5 PM');

-- Insert sample students
INSERT INTO users (email, password, role) VALUES ('student1@college.com', 'student123', 'student');
INSERT INTO users (email, password, role) VALUES ('student2@college.com', 'student123', 'student');

INSERT INTO students (user_id, name, roll_number, email, phone, program, year, academic_status) VALUES 
(4, 'Rahul Sharma', 'CSE001', 'student1@college.com', '9876543210', 'B.Tech CSE', 3, 'active'),
(5, 'Sneha Patel', 'CSE002', 'student2@college.com', '9876543211', 'B.Tech CSE', 2, 'active');

-- Insert sample assignments
INSERT INTO assignments (mentor_id, student_id, start_date, end_date, status) VALUES
(1, 1, '2024-01-15', '2024-12-31', 'active'),
(2, 2, '2024-01-15', '2024-12-31', 'active');

-- Insert sample meetings
INSERT INTO meetings (assignment_id, mentor_id, student_id, meeting_date, meeting_time, duration, mode, status) VALUES
(1, 1, 1, '2024-11-20', '14:00:00', 60, 'online', 'scheduled'),
(2, 2, 2, '2024-11-21', '15:00:00', 45, 'offline', 'scheduled');

-- Insert sample goals
INSERT INTO goals (assignment_id, mentor_id, student_id, goal_title, description, target_date, status, priority) VALUES
(1, 1, 1, 'Improve Attendance', 'Maintain 85% attendance in all subjects', '2024-12-31', 'in-progress', 'high'),
(2, 2, 2, 'Complete Project', 'Finish capstone project on time', '2024-12-15', 'open', 'high');
