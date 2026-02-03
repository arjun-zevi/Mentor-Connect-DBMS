const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, verifyMentor } = require('../middleware/auth');

// Get upcoming meetings
router.get('/upcoming-meetings', verifyToken, verifyMentor, async (req, res) => {
    try {
        const mentor_id = req.user.mentor_id;
        const connection = await pool.getConnection();

        const [meetings] = await connection.query(`
            SELECT 
                m.meeting_id as meeting_id, m.meeting_date as meeting_date, m.meeting_time as meeting_time,
                s.name as student_name, s.roll_number
            FROM meetings m
            INNER JOIN students s ON m.student_id = s.student_id
            WHERE m.mentor_id = ? AND m.meeting_date >= CURDATE() AND m.status = 'scheduled'
            ORDER BY m.meeting_date
        `, [mentor_id]);

        connection.release();

        res.json(meetings);
    } catch (error) {
        console.error('Error fetching upcoming meetings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get overdue meetings
router.get('/overdue-meetings', verifyToken, verifyMentor, async (req, res) => {
    try {
        const mentor_id = req.user.mentor_id;
        const connection = await pool.getConnection();

        const [meetings] = await connection.query(`
            SELECT 
                m.meeting_id as meeting_id, m.meeting_date as meeting_date, m.meeting_time as meeting_time,
                s.name as student_name, s.roll_number, m.status
            FROM meetings m
            INNER JOIN students s ON m.student_id = s.student_id
            WHERE m.mentor_id = ? 
            AND m.meeting_date < CURDATE() 
            AND m.status IN ('scheduled', 'missed', 'done', 'cancelled')
            ORDER BY m.meeting_date DESC
        `, [mentor_id]);

        connection.release();

        res.json(meetings);
    } catch (error) {
        console.error('Error fetching overdue meetings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get at-risk students
router.get('/at-risk-students', verifyToken, verifyMentor, async (req, res) => {
    try {
        const mentor_id = req.user.mentor_id;
        const connection = await pool.getConnection();

        const [students] = await connection.query(`
            SELECT DISTINCT
                s.student_id as student_id, s.name, s.roll_number, s.academic_status
            FROM students s
            INNER JOIN assignments a ON s.student_id = a.student_id
            INNER JOIN goals g ON s.student_id = g.student_id
            WHERE a.mentor_id = ? AND g.status <> 'completed'
            ORDER BY s.name
        `, [mentor_id]);

        connection.release();

        res.json(students);
    } catch (error) {
        console.error('Error fetching at-risk students:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get mentee count
router.get('/mentee-count', verifyToken, verifyMentor, async (req, res) => {
    try {
        const mentor_id = req.user.mentor_id;
        const connection = await pool.getConnection();

        const [result] = await connection.query(`
            SELECT COUNT(*) as total_mentees 
            FROM assignments 
            WHERE mentor_id = ? AND status = 'active'
        `, [mentor_id]);

        connection.release();

        res.json({ total_mentees: result[0].total_mentees });
    } catch (error) {
        console.error('Error fetching mentee count:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get dashboard stats
router.get('/dashboard-stats', verifyToken, verifyMentor, async (req, res) => {
    try {
        const mentor_id = req.user.mentor_id;
        const connection = await pool.getConnection();

        const [stats] = await connection.query(`
            SELECT
                (SELECT COUNT(*) FROM assignments WHERE mentor_id = ? AND status = 'active') as total_mentees,
                (SELECT COUNT(*) FROM meetings WHERE mentor_id = ? AND meeting_date >= CURDATE() AND status = 'scheduled') as upcoming_meetings,
                (SELECT COUNT(*) FROM meetings WHERE mentor_id = ? AND meeting_date < CURDATE() AND status IN ('scheduled', 'missed')) as overdue_meetings,
                (SELECT COUNT(*) FROM goals WHERE mentor_id = ? AND status IN ('open', 'in-progress')) as active_goals,
                (SELECT COUNT(*) FROM interventions WHERE mentor_id = ? AND status = 'active') as active_interventions
        `, [mentor_id, mentor_id, mentor_id, mentor_id, mentor_id]);

        connection.release();

        res.json(stats[0]);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
