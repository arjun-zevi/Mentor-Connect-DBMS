const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function resetPasswords() {
    let connection;
    try {
        connection = await pool.getConnection();
        
        console.log('Resetting all user passwords to: password123\n');
        
        // Generate fresh hash
        const hashedPassword = await bcrypt.hash('password123', 10);
        console.log('Generated hash:', hashedPassword);
        
        // Update all users
        await connection.query('UPDATE users SET password = ?', [hashedPassword]);
        console.log('\n✓ All passwords reset successfully!');
        console.log('\nLogin with any of these:');
        console.log('- admin@mentorship.com / password123');
        console.log('- mentor_rajesh@college.com / password123');
        console.log('- student_vikram@college.com / password123');
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

resetPasswords();
