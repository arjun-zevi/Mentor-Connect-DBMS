const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, verifyMentor } = require('../middleware/auth');

// Create an intervention
router.post('/', verifyToken, verifyMentor, async (req, res) => {
    try {
        const { assignment_id, student_id, intervention_type, description, action_date } = req.body;
        const mentor_id = req.user.mentor_id;

        if (!assignment_id || !student_id || !action_date) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `INSERT INTO interventions 
            (assignment_id, mentor_id, student_id, intervention_type, description, action_date, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [assignment_id, mentor_id, student_id, intervention_type || 'other', description, action_date]
        );

        connection.release();

        res.status(201).json({ 
            message: 'Intervention recorded successfully',
            intervention_id: result.insertId
        });
    } catch (error) {
        console.error('Error creating intervention:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get interventions for a student
router.get('/student/:student_id', verifyToken, verifyMentor, async (req, res) => {
    try {
        const { student_id } = req.params;
        const mentor_id = req.user.mentor_id;
        const connection = await pool.getConnection();

        const [interventions] = await connection.query(`
            SELECT * FROM interventions 
            WHERE student_id = ? AND mentor_id = ?
            ORDER BY action_date DESC
        `, [student_id, mentor_id]);

        connection.release();

        res.json(interventions);
    } catch (error) {
        console.error('Error fetching interventions:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update intervention status and outcome
router.put('/:intervention_id', verifyToken, verifyMentor, async (req, res) => {
    try {
        const { intervention_id } = req.params;
        const { status, outcome } = req.body;
        const mentor_id = req.user.mentor_id;

        if (!['pending', 'completed', 'ongoing'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `UPDATE interventions 
            SET status = ?, outcome = ? 
            WHERE intervention_id = ? AND mentor_id = ?`,
            [status, outcome, intervention_id, mentor_id]
        );

        if (result.affectedRows === 0) {
            connection.release();
            return res.status(404).json({ message: 'Intervention not found' });
        }

        connection.release();

        res.json({ message: 'Intervention updated successfully' });
    } catch (error) {
        console.error('Error updating intervention:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all active interventions for mentor
router.get('/active/all', verifyToken, verifyMentor, async (req, res) => {
    try {
        const mentor_id = req.user.mentor_id;
        const connection = await pool.getConnection();

        const [interventions] = await connection.query(`
            SELECT 
                i.intervention_id, i.intervention_type, i.description, i.action_date,
                i.status, i.outcome, s.name as student_name, s.roll_number
            FROM interventions i
            INNER JOIN students s ON i.student_id = s.student_id
            WHERE i.mentor_id = ? AND i.status IN ('pending', 'ongoing')
            ORDER BY i.action_date DESC
        `, [mentor_id]);

        connection.release();

        res.json(interventions);
    } catch (error) {
        console.error('Error fetching active interventions:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
