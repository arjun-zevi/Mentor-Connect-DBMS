const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, verifyMentor } = require('../middleware/auth');

// Get all assigned mentees for a mentor
router.get('/mentees', verifyToken, verifyMentor, async (req, res) => {
    try {
        const mentor_id = req.user.mentor_id;
        const connection = await pool.getConnection();

        const [mentees] = await connection.query(`
            SELECT 
                s.student_id as student_id, s.name, s.roll_number, s.email, 
                s.phone, s.program, s.year, s.academic_status,
                a.assignment_id as assignment_id, a.start_date, a.end_date
            FROM students s
            INNER JOIN assignments a ON s.student_id = a.student_id
            WHERE a.mentor_id = ?
            ORDER BY s.name
        `, [mentor_id]);

        connection.release();

        res.json(mentees);
    } catch (error) {
        console.error('Error fetching mentees:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get mentor profile
router.get('/profile', verifyToken, verifyMentor, async (req, res) => {
    try {
        const mentor_id = req.user.mentor_id;
        const connection = await pool.getConnection();

        const [mentors] = await connection.query(
            'SELECT * FROM mentors WHERE mentor_id = ?',
            [mentor_id]
        );

        if (mentors.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'Mentor not found' });
        }

        // Get workload (number of active mentees)
        const [workload] = await connection.query(`
            SELECT COUNT(*) as mentee_count 
            FROM assignments 
            WHERE mentor_id = ? AND status = 'active'
        `, [mentor_id]);

        connection.release();

        res.json({
            ...mentors[0],
            mentee_count: workload[0].mentee_count
        });
    } catch (error) {
        console.error('Error fetching mentor profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update mentor profile
router.put('/profile', verifyToken, verifyMentor, async (req, res) => {
    try {
        const mentor_id = req.user.mentor_id;
        const { name, department, availability } = req.body;

        const connection = await pool.getConnection();

        await connection.query(
            'UPDATE mentors SET name = ?, department = ?, availability = ? WHERE mentor_id = ?',
            [name, department, availability, mentor_id]
        );

        connection.release();

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating mentor profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get list of all students (for mentor to pick from)
router.get('/students/all', verifyToken, verifyMentor, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        // Return all students with their active assignment if any and the assigned mentor name
        const [students] = await connection.query(`
            SELECT s.student_id, s.name, s.roll_number, s.email,
                   a.assignment_id, a.status as assignment_status,
                   mt.name as assigned_mentor
            FROM students s
            LEFT JOIN assignments a ON s.student_id = a.student_id AND a.status = 'active'
            LEFT JOIN mentors mt ON a.mentor_id = mt.mentor_id
            ORDER BY s.name
        `);

        connection.release();
        res.json(students);
    } catch (error) {
        console.error('Error fetching students for mentor:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Mentor assigns a student (create assignment)
router.post('/assign', verifyToken, verifyMentor, async (req, res) => {
    try {
        const mentor_id = req.user.mentor_id;
        const { student_id, start_date, end_date } = req.body;

        if (!student_id || !start_date) {
            return res.status(400).json({ message: 'student_id and start_date are required' });
        }

        const connection = await pool.getConnection();

        // Ensure student exists
        const [students] = await connection.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
        if (students.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'Student not found' });
        }

        // Prevent duplicate active assignment
        const [existing] = await connection.query(
            'SELECT * FROM assignments WHERE student_id = ? AND status = "active"',
            [student_id]
        );
        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ message: 'Student already has an active assignment' });
        }

        // Insert assignment
        await connection.query(
            'INSERT INTO assignments (mentor_id, student_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
            [mentor_id, student_id, start_date, end_date || null, 'active']
        );

        connection.release();

        res.status(201).json({ message: 'Assignment created' });
    } catch (error) {
        console.error('Error creating assignment by mentor:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

