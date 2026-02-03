const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function fixData() {
    let connection;
    try {
        connection = await pool.getConnection();
        
        console.log('Fixing database data...\n');
        
        // Clear old data
        await connection.query('DELETE FROM mentors');
        await connection.query('DELETE FROM students');
        
        console.log('Inserting mentors...');
        // Insert mentors
        await connection.query(
            'INSERT INTO mentors (name, email, department) VALUES (?, ?, ?)',
            ['Dr. Rajesh Kumar', 'mentor_rajesh@college.com', 'Information Technology']
        );
        console.log('✓ Mentor 1: Dr. Rajesh Kumar');
        
        await connection.query(
            'INSERT INTO mentors (name, email, department) VALUES (?, ?, ?)',
            ['Prof. Priya Singh', 'mentor_priya@college.com', 'Computer Science']
        );
        console.log('✓ Mentor 2: Prof. Priya Singh');
        
        console.log('\nInserting students...');
        // Insert students
        await connection.query(
            'INSERT INTO students (name, roll_number, email, program, year) VALUES (?, ?, ?, ?, ?)',
            ['Vikram Gupta', 'CSE2024001', 'student_vikram@college.com', 'B.Tech CSE', 2]
        );
        console.log('✓ Student 1: Vikram Gupta');
        
        await connection.query(
            'INSERT INTO students (name, roll_number, email, program, year) VALUES (?, ?, ?, ?, ?)',
            ['Ananya Verma', 'CSE2024002', 'student_ananya@college.com', 'B.Tech CSE', 2]
        );
        console.log('✓ Student 2: Ananya Verma');
        
        console.log('\n✓ Database fixed successfully!\n');
        console.log('Login Credentials:');
        console.log('Admin: admin@mentorship.com / password123');
        console.log('Mentor: mentor_rajesh@college.com / password123');
        console.log('Student: student_vikram@college.com / password123');
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

fixData();
