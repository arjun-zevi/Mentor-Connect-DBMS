const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, verifyMentor } = require('../middleware/auth');
const { verifyStudent } = require('../middleware/auth');

// Create a meeting (mentors, students, parents can request)
router.post('/', verifyToken, async (req, res) => {
    try {
        console.log('DEBUG: POST /api/meetings invoked');
        console.log('DEBUG: Authenticated user payload:', req.user);
        console.log('DEBUG: Request body:', req.body);
        const { assignment_id, student_id: body_student_id, meeting_date, meeting_time, duration, mode, location } = req.body;
        const role = req.user.role;

        let student_id = body_student_id;
        let mentor_id = null;

        // Determine requestor role
        if (role === 'mentor') {
            mentor_id = req.user.mentor_id;
            if (!assignment_id || !student_id || !meeting_date || !meeting_time) {
                return res.status(400).json({ message: 'Required fields missing' });
            }
        } else if (role === 'student') {
            student_id = req.user.student_id;
            if (!meeting_date || !meeting_time) return res.status(400).json({ message: 'Required fields missing' });
        } else if (role === 'parent') {
            // parent must provide student_id and it must belong to them
            if (!student_id || !meeting_date || !meeting_time) return res.status(400).json({ message: 'Required fields missing' });
            const connectionCheck = await pool.getConnection();
            // parent_id may not be present in the token (older tokens) — lookup by user_id if needed
            let parent_id = req.user.parent_id;
            if (!parent_id && req.user.user_id) {
                const [pRows] = await connectionCheck.query('SELECT parent_id FROM parents WHERE user_id = ?', [req.user.user_id]);
                if (pRows && pRows.length > 0) parent_id = pRows[0].parent_id;
            }
            const [stuRows] = await connectionCheck.query('SELECT * FROM students WHERE student_id = ? AND parent_id = ?', [student_id, parent_id]);
            connectionCheck.release();
            if (stuRows.length === 0) return res.status(403).json({ message: 'Parent not linked to this student' });
        } else {
            return res.status(403).json({ message: 'Access denied. Role not allowed to create meetings.' });
        }

        const connection = await pool.getConnection();

        // Determine mentor via assignment if needed (for student/parent requests)
        let finalAssignmentId = assignment_id;

        if ((role === 'student' || role === 'parent') && !finalAssignmentId) {
            // Find active assignment for student
            const [assRows] = await connection.query('SELECT assignment_id, mentor_id, status FROM assignments WHERE student_id = ? AND status = "active" LIMIT 1', [student_id]);
            if (!assRows || assRows.length === 0) {
                connection.release();
                return res.status(400).json({ message: 'No active assignment / mentor found for this student' });
            }
            finalAssignmentId = assRows[0].assignment_id;
            mentor_id = assRows[0].mentor_id;
        }

        // For mentor role, existing logic continues below

        if (finalAssignmentId) {
            // Try to find the provided assignment_id
            const [assignRows] = await connection.query(
                'SELECT assignment_id, mentor_id AS assigned_mentor, student_id AS assigned_student, status FROM assignments WHERE assignment_id = ?',
                [finalAssignmentId]
            );

            if (assignRows && assignRows.length > 0) {
                const assignment = assignRows[0];
                if (assignment.assigned_mentor !== mentor_id) {
                    connection.release();
                    return res.status(403).json({ message: 'Assignment does not belong to the authenticated mentor' });
                }
                if (assignment.assigned_student !== student_id) {
                    connection.release();
                    return res.status(400).json({ message: 'Student does not match the assignment' });
                }
                if (assignment.status !== 'active') {
                    connection.release();
                    return res.status(400).json({ message: 'Cannot schedule meeting for an inactive/completed assignment' });
                }
                // use provided assignment
            } else {
                // Provided assignment_id not found — attempt to find or create an assignment for this mentor+student
                // Check if student already has an active assignment with any mentor
                const [existingForStudent] = await connection.query(
                    'SELECT assignment_id, mentor_id FROM assignments WHERE student_id = ? AND status = "active" LIMIT 1',
                    [student_id]
                );
                if (existingForStudent && existingForStudent.length > 0) {
                    // If existing assignment belongs to this mentor, use it; otherwise reject
                    const existing = existingForStudent[0];
                    if (existing.mentor_id === mentor_id) {
                        finalAssignmentId = existing.assignment_id;
                    } else {
                        connection.release();
                        return res.status(400).json({ message: 'Student already has an active assignment with another mentor' });
                    }
                } else {
                    // Create a new assignment for this mentor and student
                    const [ins] = await connection.query('INSERT INTO assignments (mentor_id, student_id, start_date, status) VALUES (?, ?, CURDATE(), ?)', [mentor_id, student_id, 'active']);
                    finalAssignmentId = ins.insertId;
                }
            }
        } else {
            // No assignment_id provided: try to find an active assignment for this mentor+student
            const [rows] = await connection.query('SELECT assignment_id, mentor_id, status FROM assignments WHERE mentor_id = ? AND student_id = ? AND status = "active" LIMIT 1', [mentor_id, student_id]);
            if (rows && rows.length > 0) {
                finalAssignmentId = rows[0].assignment_id;
            } else {
                // Check if student has active assignment with another mentor
                const [existingForStudent] = await connection.query('SELECT assignment_id, mentor_id FROM assignments WHERE student_id = ? AND status = "active" LIMIT 1', [student_id]);
                if (existingForStudent && existingForStudent.length > 0) {
                    const existing = existingForStudent[0];
                    if (existing.mentor_id === mentor_id) {
                        finalAssignmentId = existing.assignment_id;
                    } else {
                        connection.release();
                        return res.status(400).json({ message: 'Student already has an active assignment with another mentor' });
                    }
                } else {
                    // create new assignment
                    const [ins] = await connection.query('INSERT INTO assignments (mentor_id, student_id, start_date, status) VALUES (?, ?, CURDATE(), ?)', [mentor_id, student_id, 'active']);
                    finalAssignmentId = ins.insertId;
                }
            }
        }

        // At this point we must determine mentor_id if still null
        if (!mentor_id) {
            // fetch assignment to get mentor
            const [aRows2] = await connection.query('SELECT mentor_id FROM assignments WHERE assignment_id = ?', [finalAssignmentId]);
            if (!aRows2 || aRows2.length === 0) {
                connection.release();
                return res.status(400).json({ message: 'Assignment not found' });
            }
            mentor_id = aRows2[0].mentor_id;
        }

        // Check mentor availability: no overlapping scheduled meetings
        const reqDuration = parseInt(duration || 60, 10);
        const [conflicts] = await connection.query(
            `SELECT meeting_id, meeting_time, duration FROM meetings WHERE mentor_id = ? AND meeting_date = ? AND status IN ('scheduled','requested') AND NOT (
                ADDTIME(meeting_time, SEC_TO_TIME(duration*60)) <= ? OR meeting_time >= ADDTIME(?, SEC_TO_TIME(?*60))
            )`,
            [mentor_id, meeting_date, meeting_time, meeting_time, reqDuration]
        );
        if (conflicts && conflicts.length > 0) {
            connection.release();
            return res.status(409).json({ message: 'Not available at this time' });
        }


        // Create meetings as 'scheduled' directly for all requestors (mentor/student/parent)
        // so meetings show up immediately to mentors.
        const meetingStatus = 'scheduled';

        // determine requester info (user id, role, name) to record who requested the meeting
        let requested_by_user_id = req.user.user_id || null;
        let requested_by_role = role || null;
        let requested_by_name = null;
        if (role === 'parent') {
            // get parent profile name
            const [pRows] = await connection.query('SELECT name FROM parents WHERE user_id = ?', [req.user.user_id]);
            requested_by_name = (pRows && pRows.length) ? pRows[0].name : null;
        } else if (role === 'student') {
            const [sRows] = await connection.query('SELECT name FROM students WHERE user_id = ?', [req.user.user_id]);
            requested_by_name = (sRows && sRows.length) ? sRows[0].name : null;
        } else if (role === 'mentor') {
            const [mRows] = await connection.query('SELECT name FROM mentors WHERE user_id = ?', [req.user.user_id]);
            requested_by_name = (mRows && mRows.length) ? mRows[0].name : null;
        }

        const [result] = await connection.query(
            `INSERT INTO meetings 
            (assignment_id, mentor_id, student_id, meeting_date, meeting_time, duration, mode, location, status, requested_by_user_id, requested_by_role, requested_by_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [finalAssignmentId, mentor_id, student_id, meeting_date, meeting_time, duration, mode, location, meetingStatus, requested_by_user_id, requested_by_role, requested_by_name]
        );

        // Fetch the created meeting to return full details
        const [createdRows] = await connection.query('SELECT meeting_id, assignment_id, mentor_id, student_id, meeting_date, meeting_time, duration, mode, location, status, created_at FROM meetings WHERE meeting_id = ?', [result.insertId]);
        const created = createdRows && createdRows.length ? createdRows[0] : null;

        console.log('Meeting created:', { meeting_id: result.insertId, role, meetingStatus, created });

        connection.release();

        res.status(201).json({ 
            message: 'Meeting scheduled successfully',
            meeting: created
        });
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get upcoming meetings for mentor
router.get('/upcoming', verifyToken, verifyMentor, async (req, res) => {
    try {
        const mentor_id = req.user.mentor_id;
        const connection = await pool.getConnection();

        // Include both scheduled and requested meetings so mentors can accept/decline requests
        const [meetings] = await connection.query(`
            SELECT 
                m.meeting_id, m.meeting_date, m.meeting_time, m.duration,
                m.mode, m.status, m.location, m.created_at,
                s.name as student_name, s.roll_number,
                m.requested_by_name, m.requested_by_role
            FROM meetings m
            INNER JOIN students s ON m.student_id = s.student_id
            WHERE m.mentor_id = ? AND m.meeting_date >= CURDATE() AND m.status IN ('scheduled','requested')
            ORDER BY m.meeting_date, m.meeting_time
        `, [mentor_id]);

        connection.release();

        res.json(meetings);
    } catch (error) {
        console.error('Error fetching upcoming meetings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Student: Get upcoming meetings for the logged-in student
router.get('/student/upcoming', verifyToken, verifyStudent, async (req, res) => {
    try {
        const student_id = req.user.student_id;
        const connection = await pool.getConnection();

        const [meetings] = await connection.query(`
            SELECT 
                m.meeting_id, m.meeting_date, m.meeting_time, m.duration,
                m.mode, m.status, m.location, m.created_at,
                mt.name as mentor_name,
                m.requested_by_name, m.requested_by_role
            FROM meetings m
            INNER JOIN mentors mt ON m.mentor_id = mt.mentor_id
            WHERE m.student_id = ? AND m.meeting_date >= CURDATE() AND m.status = 'scheduled'
            ORDER BY m.meeting_date, m.meeting_time
        `, [student_id]);

        connection.release();
        res.json(meetings);
    } catch (error) {
        console.error('Error fetching student upcoming meetings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Student: Get all meetings for the logged-in student
router.get('/student/me', verifyToken, verifyStudent, async (req, res) => {
    try {
        const student_id = req.user.student_id;
        const connection = await pool.getConnection();

        const [meetings] = await connection.query(`
            SELECT 
                m.meeting_id, m.meeting_date, m.meeting_time, m.duration,
                m.mode, m.status, m.location, m.created_at,
                mt.name as mentor_name,
                m.requested_by_name, m.requested_by_role
            FROM meetings m
            INNER JOIN mentors mt ON m.mentor_id = mt.mentor_id
            WHERE m.student_id = ?
            ORDER BY m.meeting_date DESC
        `, [student_id]);

        connection.release();
        res.json(meetings);
    } catch (error) {
        console.error('Error fetching student meetings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get meetings for a specific student (mentor view or parent access)
router.get('/student/:student_id', verifyToken, async (req, res) => {
    try {
        const { student_id } = req.params;
        const connection = await pool.getConnection();

        // Mentor: can request meetings for their mentee
        if (req.user.role === 'mentor') {
            const mentor_id = req.user.mentor_id;

            const [meetings] = await connection.query(`
                SELECT 
                    m.meeting_id, m.meeting_date, m.meeting_time, m.duration,
                    m.mode, m.status, m.location, m.created_at
                FROM meetings m
                WHERE m.student_id = ? AND m.mentor_id = ?
                ORDER BY m.meeting_date DESC
            `, [student_id, mentor_id]);

            connection.release();
            return res.json(meetings);
        }

        // Parent: must be linked to the student
        if (req.user.role === 'parent') {
            // parent_id may not be present in the token (older tokens) — lookup by user_id if needed
            let parent_id = req.user.parent_id;
            if (!parent_id && req.user.user_id) {
                const [pRows] = await connection.query('SELECT parent_id FROM parents WHERE user_id = ?', [req.user.user_id]);
                if (pRows && pRows.length > 0) parent_id = pRows[0].parent_id;
            }
            const [stuRows] = await connection.query('SELECT * FROM students WHERE student_id = ? AND parent_id = ?', [student_id, parent_id]);
            if (!stuRows || stuRows.length === 0) {
                connection.release();
                return res.status(403).json({ message: 'Parent not linked to this student' });
            }

            const [meetings] = await connection.query(`
                SELECT 
                    m.meeting_id, m.meeting_date, m.meeting_time, m.duration,
                    m.mode, m.status, m.location, m.created_at,
                    mt.name as mentor_name
                FROM meetings m
                LEFT JOIN mentors mt ON m.mentor_id = mt.mentor_id
                WHERE m.student_id = ?
                ORDER BY m.meeting_date DESC
            `, [student_id]);

            connection.release();
            return res.json(meetings);
        }

        connection.release();
        return res.status(403).json({ message: 'Access denied' });
    } catch (error) {
        console.error('Error fetching student meetings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get meeting details (mentor) - includes student_id
router.get('/details/:meeting_id', verifyToken, verifyMentor, async (req, res) => {
    try {
        const { meeting_id } = req.params;
        const mentor_id = req.user.mentor_id;
        const connection = await pool.getConnection();

        const [rows] = await connection.query(
            `SELECT meeting_id, assignment_id, mentor_id, student_id, meeting_date, meeting_time, duration, mode, location, status
             FROM meetings WHERE meeting_id = ? AND mentor_id = ?`,
            [meeting_id, mentor_id]
        );

        connection.release();

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching meeting details:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update meeting status
router.put('/:meeting_id', verifyToken, verifyMentor, async (req, res) => {
    try {
        const { meeting_id } = req.params;
        const { status } = req.body;
        const mentor_id = req.user.mentor_id;

        if (!['scheduled', 'done', 'missed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'UPDATE meetings SET status = ? WHERE meeting_id = ? AND mentor_id = ?',
            [status, meeting_id, mentor_id]
        );

        if (result.affectedRows === 0) {
            connection.release();
            return res.status(404).json({ message: 'Meeting not found' });
        }

        connection.release();

        res.json({ message: 'Meeting updated successfully' });
    } catch (error) {
        console.error('Error updating meeting:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get overdue meetings
router.get('/overdue/list', verifyToken, verifyMentor, async (req, res) => {
    try {
        const mentor_id = req.user.mentor_id;
        const connection = await pool.getConnection();

        const [meetings] = await connection.query(`
            SELECT 
                m.meeting_id, m.meeting_date, m.meeting_time, m.duration,
                m.mode, m.status, m.location,
                s.name as student_name, s.roll_number
            FROM meetings m
            INNER JOIN students s ON m.student_id = s.student_id
            WHERE m.mentor_id = ? 
            AND (
                m.meeting_date < CURDATE()
                OR m.status IN ('done', 'missed', 'cancelled')
            )
            ORDER BY m.meeting_date
        `, [mentor_id]);

        connection.release();

        res.json(meetings);
    } catch (error) {
        console.error('Error fetching overdue meetings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
