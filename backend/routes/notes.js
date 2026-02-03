const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, verifyMentor } = require('../middleware/auth');

// Add meeting notes
router.post('/', verifyToken, verifyMentor, async (req, res) => {
    try {
        const { meeting_id, student_id, note_content } = req.body;
        const mentor_id = req.user.mentor_id;

        if (!meeting_id || !student_id || !note_content) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `INSERT INTO meeting_notes 
            (meeting_id, mentor_id, student_id, note_content)
            VALUES (?, ?, ?, ?)`,
            [meeting_id, mentor_id, student_id, note_content]
        );

        connection.release();

        res.status(201).json({ 
            message: 'Note added successfully',
            note_id: result.insertId
        });
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get meeting notes for a meeting (mentor or the student who belongs to the meeting)
router.get('/meeting/:meeting_id', verifyToken, async (req, res) => {
    try {
        const { meeting_id } = req.params;
        const connection = await pool.getConnection();

        // fetch the meeting to validate access
        const [meetings] = await connection.query('SELECT meeting_id, student_id, mentor_id FROM meetings WHERE meeting_id = ?', [meeting_id]);
        if (!meetings || meetings.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'Meeting not found' });
        }
        const meeting = meetings[0];

        // allow mentor who owns the meeting or the student who is the meeting subject
        if (req.user.role === 'mentor') {
            if (req.user.mentor_id !== meeting.mentor_id) {
                connection.release();
                return res.status(403).json({ message: 'Access denied' });
            }
        } else if (req.user.role === 'student') {
            if (req.user.student_id !== meeting.student_id) {
                connection.release();
                return res.status(403).json({ message: 'Access denied' });
            }
        } else {
            connection.release();
            return res.status(403).json({ message: 'Access denied' });
        }

        const [notes] = await connection.query(
            `SELECT mn.*, mt.name as mentor_name, m.meeting_date, m.meeting_time
            FROM meeting_notes mn
            LEFT JOIN mentors mt ON mn.mentor_id = mt.mentor_id
            LEFT JOIN meetings m ON mn.meeting_id = m.meeting_id
            WHERE mn.meeting_id = ? 
            ORDER BY mn.created_at DESC`,
            [meeting_id]
        );

        connection.release();

        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get meeting notes for a student (mentor or the student themself)
router.get('/meeting/student/:student_id', verifyToken, async (req, res) => {
    try {
        const { student_id } = req.params;
        const connection = await pool.getConnection();

        if (req.user.role === 'student') {
            if (req.user.student_id !== parseInt(student_id, 10)) {
                connection.release();
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        // mentors can only view notes for their students
        let params = [student_id];
        let whereExtra = '';
        if (req.user.role === 'mentor') {
            whereExtra = ' AND mn.mentor_id = ?';
            params.push(req.user.mentor_id);
        }

        const [notes] = await connection.query(
            `SELECT mn.*, mt.name as mentor_name, m.meeting_date, m.meeting_time
            FROM meeting_notes mn
            LEFT JOIN mentors mt ON mn.mentor_id = mt.mentor_id
            LEFT JOIN meetings m ON mn.meeting_id = m.meeting_id
            WHERE mn.student_id = ? ${whereExtra}
            ORDER BY mn.created_at DESC`,
            params
        );

        connection.release();

        res.json(notes);
    } catch (error) {
        console.error('Error fetching student meeting notes:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add general note for student
router.post('/general/add', verifyToken, verifyMentor, async (req, res) => {
    try {
        const { assignment_id, student_id, note_type, note_content } = req.body;
        const mentor_id = req.user.mentor_id;

        if (!assignment_id || !student_id || !note_content) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `INSERT INTO general_notes 
            (assignment_id, mentor_id, student_id, note_type, note_content)
            VALUES (?, ?, ?, ?, ?)`,
            [assignment_id, mentor_id, student_id, note_type || 'other', note_content]
        );

        connection.release();

        res.status(201).json({ 
            message: 'General note added successfully',
            general_note_id: result.insertId
        });
    } catch (error) {
        console.error('Error adding general note:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get general notes for a student
router.get('/general/student/:student_id', verifyToken, verifyMentor, async (req, res) => {
    try {
        const { student_id } = req.params;
        const mentor_id = req.user.mentor_id;
        const connection = await pool.getConnection();

        const [notes] = await connection.query(
            `SELECT * FROM general_notes 
            WHERE student_id = ? AND mentor_id = ?
            ORDER BY created_at DESC`,
            [student_id, mentor_id]
        );

        connection.release();

        res.json(notes);
    } catch (error) {
        console.error('Error fetching general notes:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update general note
router.put('/general/:note_id', verifyToken, verifyMentor, async (req, res) => {
    try {
        const { note_id } = req.params;
        const { note_content, note_type } = req.body;
        const mentor_id = req.user.mentor_id;

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `UPDATE general_notes 
            SET note_content = ?, note_type = ? 
            WHERE general_note_id = ? AND mentor_id = ?`,
            [note_content, note_type, note_id, mentor_id]
        );

        if (result.affectedRows === 0) {
            connection.release();
            return res.status(404).json({ message: 'Note not found' });
        }

        connection.release();

        res.json({ message: 'Note updated successfully' });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
