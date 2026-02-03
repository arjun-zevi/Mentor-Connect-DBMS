const pool = require('./config/database');

async function checkSchema() {
    let connection;
    try {
        connection = await pool.getConnection();
        
        console.log('=== MENTORS TABLE STRUCTURE ===');
        const [mentorsCols] = await connection.query('DESCRIBE mentors');
        console.table(mentorsCols);
        
        console.log('\n=== STUDENTS TABLE STRUCTURE ===');
        const [studentsCols] = await connection.query('DESCRIBE students');
        console.table(studentsCols);
        
        console.log('\n=== USERS TABLE STRUCTURE ===');
        const [usersCols] = await connection.query('DESCRIBE users');
        console.table(usersCols);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

checkSchema();
