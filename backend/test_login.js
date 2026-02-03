const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function testLogin() {
    let connection;
    try {
        connection = await pool.getConnection();
        
        // Get the first user from database
        const [users] = await connection.query('SELECT email, password FROM users WHERE email = ?', ['student1@college.com']);
        
        if (users.length === 0) {
            console.log('❌ User not found in database');
            return;
        }
        
        const user = users[0];
        console.log('User found:', user.email);
        console.log('Stored hash:', user.password);
        
        // Test password comparison
        const testPassword = 'password123';
        const match = await bcrypt.compare(testPassword, user.password);
        
        console.log('\nPassword comparison:');
        console.log('Test password:', testPassword);
        console.log('Hash matches:', match ? '✓ YES' : '❌ NO');
        
        if (!match) {
            console.log('\nThe password hash doesn\'t match. Let me update it...');
            const newHash = await bcrypt.hash('password123', 10);
            console.log('New hash generated:', newHash);
            
            await connection.query('UPDATE users SET password = ? WHERE email = ?', [newHash, 'student1@college.com']);
            console.log('✓ Password updated for student1@college.com');
            
            // Update all other test users too
            const testUsers = ['admin@college.com', 'mentor1@college.com', 'mentor2@college.com', 'student2@college.com'];
            for (const email of testUsers) {
                await connection.query('UPDATE users SET password = ? WHERE email = ?', [newHash, email]);
                console.log(`✓ Password updated for ${email}`);
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

testLogin();
