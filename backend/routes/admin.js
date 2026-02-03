const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Get all students
router.get('/all', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [students] = await connection.query(`
            SELECT 
                s.student_id as student_id, s.name, s.roll_number, s.email, 
                s.phone, s.program, s.year, s.academic_status
            FROM students s
            ORDER BY s.name
        `);

        connection.release();

        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all mentors
router.get('/mentors/all', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [mentors] = await connection.query(`
            SELECT 
                m.mentor_id as mentor_id, m.name, m.email, 
                m.department, m.availability
            FROM mentors m
            ORDER BY m.name
        `);

        connection.release();

        res.json(mentors);
    } catch (error) {
        console.error('Error fetching mentors:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Assign mentor to student
router.post('/assign', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { mentor_id, student_id, start_date, end_date } = req.body;

        if (!mentor_id || !student_id || !start_date) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const connection = await pool.getConnection();

        // Check if assignment already exists
        const [existing] = await connection.query(
            'SELECT * FROM assignments WHERE mentor_id = ? AND student_id = ? AND status = "active"',
            [mentor_id, student_id]
        );

        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ message: 'Active assignment already exists' });
        }

        const [result] = await connection.query(
            `INSERT INTO assignments 
            (mentor_id, student_id, start_date, end_date, status)
            VALUES (?, ?, ?, ?, 'active')`,
            [mentor_id, student_id, start_date, end_date || null]
        );

        connection.release();

        res.status(201).json({ 
            message: 'Assignment created successfully',
            assignment_id: result.insertId
        });
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all assignments
router.get('/assignments/all', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [assignments] = await connection.query(`
            SELECT 
                a.assignment_id as assignment_id, a.mentor_id, a.student_id,
                m.name as mentor_name, s.name as student_name, s.roll_number,
                a.start_date, a.end_date, a.created_at
            FROM assignments a
            INNER JOIN mentors m ON a.mentor_id = m.mentor_id
            INNER JOIN students s ON a.student_id = s.student_id
            ORDER BY a.start_date DESC
        `);

        connection.release();

        res.json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update assignment status
router.put('/assign/:assignment_id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { assignment_id } = req.params;
        const { status, end_date } = req.body;

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `UPDATE assignments 
            SET status = ?, end_date = ? 
            WHERE assignment_id = ?`,
            [status, end_date, assignment_id]
        );

        if (result.affectedRows === 0) {
            connection.release();
            return res.status(404).json({ message: 'Assignment not found' });
        }

        connection.release();

        res.json({ message: 'Assignment updated successfully' });
    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

// Delete mentor (and cascade via users table)
router.delete('/mentors/:mentor_id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { mentor_id } = req.params;
        const connection = await pool.getConnection();

        const [rows] = await connection.query('SELECT user_id FROM mentors WHERE mentor_id = ?', [mentor_id]);
        if (rows.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'Mentor not found' });
        }

        const userId = rows[0].user_id;
        await connection.query('DELETE FROM users WHERE user_id = ?', [userId]);

        connection.release();
        res.json({ message: 'Mentor deleted' });
    } catch (error) {
        console.error('Error deleting mentor:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete student (and cascade via users table)
router.delete('/students/:student_id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { student_id } = req.params;
        const connection = await pool.getConnection();

        const [rows] = await connection.query('SELECT user_id FROM students WHERE student_id = ?', [student_id]);
        if (rows.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'Student not found' });
        }

        const userId = rows[0].user_id;
        await connection.query('DELETE FROM users WHERE user_id = ?', [userId]);

        connection.release();
        res.json({ message: 'Student deleted' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

