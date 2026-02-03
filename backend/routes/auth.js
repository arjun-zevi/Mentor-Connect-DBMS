const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_key';

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const connection = await pool.getConnection();
        
        // Get user
        const [users] = await connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            connection.release();
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        
        // Simple plain text password comparison
        if (password !== user.password) {
            connection.release();
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Get role-specific data
        let userData = { user_id: user.user_id, email: user.email, role: user.role };

        // Prefer looking up profile rows by user_id (more robust than email matching)
        if (user.role === 'mentor') {
            const [mentors] = await connection.query(
                'SELECT * FROM mentors WHERE user_id = ?',
                [user.user_id]
            );
            if (mentors.length > 0) {
                userData = { ...userData, mentor_id: mentors[0].mentor_id, name: mentors[0].name };
            }
        } else if (user.role === 'student') {
            const [students] = await connection.query(
                'SELECT * FROM students WHERE user_id = ?',
                [user.user_id]
            );
            if (students.length > 0) {
                userData = { ...userData, student_id: students[0].student_id, name: students[0].name };
            }
        } else if (user.role === 'parent') {
            const [parents] = await connection.query(
                'SELECT * FROM parents WHERE user_id = ?',
                [user.user_id]
            );
            if (parents.length > 0) {
                userData = { ...userData, parent_id: parents[0].parent_id, name: parents[0].name };
            }
        }

        connection.release();

        const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '24h' });

        res.json({ 
            token, 
            user: userData,
            message: 'Login successful' 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Register student (by admin)
router.post('/register-student', async (req, res) => {
    try {
        const { email, password, name, roll_number, phone, program, year,
            parent_email, parent_password, parent_name, parent_phone, parent_relation } = req.body;

        if (!email || !password || !name || !roll_number) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const connection = await pool.getConnection();

        // Check if email exists
        const [existing] = await connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Plain text password (no hashing)
        const hashedPassword = password;


        let parentId = null;
        // If parent data provided, create parent user and parent profile (or reuse existing parent user)
        if (parent_email && parent_name) {
            // Check if parent user exists
            const [existingParentUser] = await connection.query('SELECT * FROM users WHERE email = ?', [parent_email]);
            let parentUserId;
            if (existingParentUser.length > 0) {
                parentUserId = existingParentUser[0].user_id;
            } else {
                const parentPassword = parent_password || 'parent123';
                const [parentUserRes] = await connection.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [parent_email, parentPassword, 'parent']);
                parentUserId = parentUserRes.insertId;
            }

            // Check if parent profile exists
            const [existingParentProfile] = await connection.query('SELECT * FROM parents WHERE user_id = ?', [parentUserId]);
            if (existingParentProfile.length > 0) {
                parentId = existingParentProfile[0].parent_id;
            } else {
                const [parentRes] = await connection.query('INSERT INTO parents (user_id, name, email, phone, relation) VALUES (?, ?, ?, ?, ?)', [parentUserId, parent_name, parent_email, parent_phone || null, parent_relation || null]);
                parentId = parentRes.insertId;
            }
        }

        // Create user for student
        const [userResult] = await connection.query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, 'student']
        );

        // Create student profile
        const userId = userResult.insertId;
        await connection.query(
            'INSERT INTO students (user_id, parent_id, name, roll_number, email, phone, program, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, parentId, name, roll_number, email, phone, program, year]
        );

        connection.release();

        res.status(201).json({ message: 'Student registered successfully' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Register mentor (by admin)
router.post('/register-mentor', async (req, res) => {
    try {
        const { email, password, name, department, availability } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const connection = await pool.getConnection();

        // Check if email exists
        const [existing] = await connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Plain text password (no hashing)
        const hashedPassword = password;

        // Create user
        const [userResult] = await connection.query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, 'mentor']
        );

        // Create mentor profile
        const userId = userResult.insertId;
        await connection.query(
            'INSERT INTO mentors (user_id, name, email, department, availability) VALUES (?, ?, ?, ?, ?)',
            [userId, name, email, department, availability]
        );

        connection.release();

        res.status(201).json({ message: 'Mentor registered successfully' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Register parent (by admin)
router.post('/register-parent', async (req, res) => {
    try {
        const { email, password, name, phone, relation } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const connection = await pool.getConnection();

        // Check if email exists
        const [existing] = await connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = password;

        // Create user
        const [userResult] = await connection.query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, 'parent']
        );

        // Create parent profile
        const userId = userResult.insertId;
        await connection.query(
            'INSERT INTO parents (user_id, name, email, phone, relation) VALUES (?, ?, ?, ?, ?)',
            [userId, name, email, phone || null, relation || null]
        );

        connection.release();

        res.status(201).json({ message: 'Parent registered successfully' });
    } catch (error) {
        console.error('Register parent error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
