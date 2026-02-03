const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function insertTestData() {
    let connection;
    try {
        connection = await pool.getConnection();
        
        console.log('Inserting test users...');
        
        // Insert users
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const users = [
            { email: 'admin@college.com', password: hashedPassword, role: 'admin' },
            { email: 'mentor1@college.com', password: hashedPassword, role: 'mentor' },
            { email: 'mentor2@college.com', password: hashedPassword, role: 'mentor' },
            { email: 'student1@college.com', password: hashedPassword, role: 'student' },
            { email: 'student2@college.com', password: hashedPassword, role: 'student' }
        ];
        
        for (const user of users) {
            try {
                await connection.query(
                    'INSERT IGNORE INTO users (email, password, role) VALUES (?, ?, ?)',
                    [user.email, user.password, user.role]
                );
                console.log(`✓ User created: ${user.email}`);
            } catch (err) {
                console.log(`- User already exists: ${user.email}`);
            }
        }
        
        // Get user IDs
        const [[mentor1]] = await connection.query('SELECT user_id FROM users WHERE email = ?', ['mentor1@college.com']);
        const [[mentor2]] = await connection.query('SELECT user_id FROM users WHERE email = ?', ['mentor2@college.com']);
        const [[student1]] = await connection.query('SELECT user_id FROM users WHERE email = ?', ['student1@college.com']);
        const [[student2]] = await connection.query('SELECT user_id FROM users WHERE email = ?', ['student2@college.com']);
        
        console.log('\nInserting mentors...');
        
        // Insert mentors
        const mentors = [
            { user_id: mentor1.user_id, name: 'Dr. Rajesh Kumar', email: 'mentor1@college.com', department: 'Computer Science' },
            { user_id: mentor2.user_id, name: 'Prof. Priya Singh', email: 'mentor2@college.com', department: 'Electronics' }
        ];
        
        for (const mentor of mentors) {
            try {
                await connection.query(
                    'INSERT IGNORE INTO mentors (user_id, name, email, department) VALUES (?, ?, ?, ?)',
                    [mentor.user_id, mentor.name, mentor.email, mentor.department]
                );
                console.log(`✓ Mentor created: ${mentor.name}`);
            } catch (err) {
                console.log(`- Mentor already exists: ${mentor.name}`);
            }
        }
        
        console.log('\nInserting students...');
        
        // Insert students
        const students = [
            { user_id: student1.user_id, name: 'Arjun Patel', roll_number: 'CSE001', email: 'student1@college.com', program: 'B.Tech CSE', year: 2 },
            { user_id: student2.user_id, name: 'Neha Sharma', roll_number: 'CSE002', email: 'student2@college.com', program: 'B.Tech CSE', year: 2 }
        ];
        
        for (const student of students) {
            try {
                await connection.query(
                    'INSERT IGNORE INTO students (user_id, name, roll_number, email, program, year) VALUES (?, ?, ?, ?, ?, ?)',
                    [student.user_id, student.name, student.roll_number, student.email, student.program, student.year]
                );
                console.log(`✓ Student created: ${student.name}`);
            } catch (err) {
                console.log(`- Student already exists: ${student.name}`);
            }
        }
        
        console.log('\n✓ All test data inserted successfully!');
        console.log('\nTest Credentials:');
        console.log('Admin: admin@college.com / password123');
        console.log('Mentor: mentor1@college.com / password123');
        console.log('Student: student1@college.com / password123');
        
    } catch (error) {
        console.error('Error inserting test data:', error);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

insertTestData();
