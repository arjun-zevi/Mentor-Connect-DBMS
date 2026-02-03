const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, verifyParent } = require('../middleware/auth');

// Get children (students) for the logged-in parent
router.get('/children', verifyToken, verifyParent, async (req, res) => {
    try {
        const parent_id = req.user.parent_id;
        const connection = await pool.getConnection();

        const [students] = await connection.query(
            'SELECT student_id, name, roll_number, email, phone, program, year FROM students WHERE parent_id = ?',
            [parent_id]
        );

        connection.release();
        res.json(students);
    } catch (error) {
        console.error('Error fetching parent children:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Parent profile placeholder: you can extend to update profile
router.get('/profile', verifyToken, verifyParent, async (req, res) => {
    try {
        const parent_id = req.user.parent_id;
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM parents WHERE parent_id = ?', [parent_id]);
        connection.release();
        if (!rows || rows.length === 0) return res.status(404).json({ message: 'Parent not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching parent profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
