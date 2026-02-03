const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, verifyMentor, verifyStudent } = require('../middleware/auth');

// Create a goal
router.post('/', verifyToken, verifyMentor, async (req, res) => {
    try {
        const { assignment_id, student_id, goal_title, description, target_date, priority } = req.body;
        const mentor_id = req.user.mentor_id;

        if (!assignment_id || !student_id || !goal_title || !target_date) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `INSERT INTO goals 
            (assignment_id, mentor_id, student_id, goal_title, description, target_date, status, priority)
            VALUES (?, ?, ?, ?, ?, ?, 'open', ?)`,
            [assignment_id, mentor_id, student_id, goal_title, description, target_date, priority || 'medium']
        );

        connection.release();

        res.status(201).json({ 
            message: 'Goal created successfully',
            goal_id: result.insertId
        });
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Student: get my goals
router.get('/student/me', verifyToken, verifyStudent, async (req, res) => {
    try {
        const student_id = req.user.student_id;
        const connection = await pool.getConnection();

        const [goals] = await connection.query(`
            SELECT g.goal_id, g.goal_title, g.description, g.target_date, g.status, g.priority, m.name as mentor_name
            FROM goals g
            INNER JOIN mentors m ON g.mentor_id = m.mentor_id
            WHERE g.student_id = ?
            ORDER BY g.target_date ASC
        `, [student_id]);

        connection.release();
        res.json(goals);
    } catch (error) {
        console.error('Error fetching student goals:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Student: mark a goal as completed (or update status)
router.put('/:goal_id/mark', verifyToken, verifyStudent, async (req, res) => {
    try {
        const { goal_id } = req.params;
        const { status } = req.body; // expected 'completed' or other allowed values
        const student_id = req.user.student_id;

        const allowed = ['open', 'in-progress', 'completed', 'deferred'];
        if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

        const connection = await pool.getConnection();

        // Ensure goal belongs to this student
        const [rows] = await connection.query('SELECT * FROM goals WHERE goal_id = ? AND student_id = ?', [goal_id, student_id]);
        if (rows.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'Goal not found' });
        }

        await connection.query('UPDATE goals SET status = ? WHERE goal_id = ?', [status, goal_id]);

        connection.release();
        res.json({ message: 'Goal status updated' });
    } catch (error) {
        console.error('Error updating student goal:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get goals for a student (mentor view)
router.get('/student/:student_id', verifyToken, verifyMentor, async (req, res) => {
    try {
        const { student_id } = req.params;
        const mentor_id = req.user.mentor_id;
        const connection = await pool.getConnection();

        const [goals] = await connection.query(`
            SELECT * FROM goals 
            WHERE student_id = ? AND mentor_id = ?
            ORDER BY target_date ASC
        `, [student_id, mentor_id]);

        connection.release();

        res.json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update goal status
router.put('/:goal_id', verifyToken, verifyMentor, async (req, res) => {
    try {
        const { goal_id } = req.params;
        const { status, priority, description } = req.body;
        const mentor_id = req.user.mentor_id;

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `UPDATE goals 
            SET status = ?, priority = ?, description = ? 
            WHERE goal_id = ? AND mentor_id = ?`,
            [status || undefined, priority || undefined, description || undefined, goal_id, mentor_id]
        );

        if (result.affectedRows === 0) {
            connection.release();
            return res.status(404).json({ message: 'Goal not found' });
        }

        connection.release();

        res.json({ message: 'Goal updated successfully' });
    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all open/in-progress goals for mentor
router.get('/active/all', verifyToken, verifyMentor, async (req, res) => {
    try {
        const mentor_id = req.user.mentor_id;
        const connection = await pool.getConnection();

        const [goals] = await connection.query(`
            SELECT 
                g.goal_id, g.goal_title, g.description, g.target_date,
                g.status, g.priority, s.name as student_name, s.roll_number
            FROM goals g
            INNER JOIN students s ON g.student_id = s.student_id
            WHERE g.mentor_id = ? AND g.status IN ('open', 'in-progress')
            ORDER BY g.target_date ASC
        `, [mentor_id]);

        connection.release();

        res.json(goals);
    } catch (error) {
        console.error('Error fetching active goals:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all goals for mentor (any status)
router.get('/all', verifyToken, verifyMentor, async (req, res) => {
    try {
        const mentor_id = req.user.mentor_id;
        const connection = await pool.getConnection();

        const [goals] = await connection.query(`
            SELECT 
                g.goal_id, g.goal_title, g.description, g.target_date,
                g.status, g.priority, s.name as student_name, s.roll_number
            FROM goals g
            INNER JOIN students s ON g.student_id = s.student_id
            WHERE g.mentor_id = ?
            ORDER BY g.target_date ASC
        `, [mentor_id]);

        connection.release();

        res.json(goals);
    } catch (error) {
        console.error('Error fetching all goals for mentor:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete goal
router.delete('/:goal_id', verifyToken, verifyMentor, async (req, res) => {
    try {
        const { goal_id } = req.params;
        const mentor_id = req.user.mentor_id;

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'DELETE FROM goals WHERE goal_id = ? AND mentor_id = ?',
            [goal_id, mentor_id]
        );

        if (result.affectedRows === 0) {
            connection.release();
            return res.status(404).json({ message: 'Goal not found' });
        }

        connection.release();

        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
