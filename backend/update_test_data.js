const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function updateTestData() {
    let connection;
    try {
        connection = await pool.getConnection();
        
        console.log('Updating test data with new names...\n');
        
        // Generate new hashed password
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        // Update users with new data
        console.log('Updating users...');
        await connection.query('UPDATE users SET email = ?, password = ? WHERE email = ?', 
            ['admin@mentorship.com', hashedPassword, 'admin@college.com']);
        console.log('✓ Admin updated: admin@mentorship.com');
        
        await connection.query('UPDATE users SET email = ?, password = ? WHERE email = ?', 
            ['mentor_rajesh@college.com', hashedPassword, 'mentor1@college.com']);
        console.log('✓ Mentor 1 updated: mentor_rajesh@college.com');
        
        await connection.query('UPDATE users SET email = ?, password = ? WHERE email = ?', 
            ['mentor_priya@college.com', hashedPassword, 'mentor2@college.com']);
        console.log('✓ Mentor 2 updated: mentor_priya@college.com');
        
        await connection.query('UPDATE users SET email = ?, password = ? WHERE email = ?', 
            ['student_vikram@college.com', hashedPassword, 'student1@college.com']);
        console.log('✓ Student 1 updated: student_vikram@college.com');
        
        await connection.query('UPDATE users SET email = ?, password = ? WHERE email = ?', 
            ['student_ananya@college.com', hashedPassword, 'student2@college.com']);
        console.log('✓ Student 2 updated: student_ananya@college.com');
        
        console.log('\nUpdating mentors...');
        await connection.query('UPDATE mentors SET name = ?, email = ?, department = ? WHERE name = ?', 
            ['Dr. Rajesh Kumar', 'mentor_rajesh@college.com', 'Information Technology', 'Dr. Rajesh Kumar']);
        console.log('✓ Mentor 1: Dr. Rajesh Kumar');
        
        await connection.query('UPDATE mentors SET name = ?, email = ?, department = ? WHERE name = ?', 
            ['Prof. Priya Singh', 'mentor_priya@college.com', 'Computer Science', 'Prof. Priya Singh']);
        console.log('✓ Mentor 2: Prof. Priya Singh');
        
        console.log('\nUpdating students...');
        await connection.query('UPDATE students SET name = ?, roll_number = ?, email = ? WHERE name = ?', 
            ['Vikram Gupta', 'CSE2024001', 'student_vikram@college.com', 'Arjun Patel']);
        console.log('✓ Student 1: Vikram Gupta (CSE2024001)');
        
        await connection.query('UPDATE students SET name = ?, roll_number = ?, email = ? WHERE name = ?', 
            ['Ananya Verma', 'CSE2024002', 'student_ananya@college.com', 'Neha Sharma']);
        console.log('✓ Student 2: Ananya Verma (CSE2024002)');
        
        console.log('\n✓ All test data updated successfully!\n');
        console.log('New Login Credentials:');
        console.log('Admin: admin@mentorship.com / password123');
        console.log('Mentor: mentor_rajesh@college.com / password123');
        console.log('Student: student_vikram@college.com / password123');
        
    } catch (error) {
        console.error('Error updating test data:', error.message);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

updateTestData();
