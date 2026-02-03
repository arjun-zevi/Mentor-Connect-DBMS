const pool = require('./config/database');

pool.getConnection().then(async conn => {
    try {
        const student_id = 5;

        const [meetings] = await conn.query(`
            SELECT 
                m.meeting_id, m.meeting_date, m.meeting_time, m.duration, 
                m.mode, m.status, m.location, m.created_at,
                mt.name as mentor_name
            FROM meetings m
            INNER JOIN mentors mt ON m.mentor_id = mt.mentor_id
            WHERE m.student_id = ?
            ORDER BY m.meeting_date DESC
        `, [student_id]);

        const [goals] = await conn.query(`
            SELECT 
                g.goal_id, g.goal_title, g.description, g.target_date, 
                g.status, g.priority, m.name as mentor_name
            FROM goals g
            INNER JOIN mentors m ON g.mentor_id = m.mentor_id
            WHERE g.student_id = ?
            ORDER BY g.target_date ASC
        `, [student_id]);

        console.log('--- MEETINGS for student_id 5 (Adith) ---');
        console.table(meetings);
        console.log('\n--- GOALS for student_id 5 (Adith) ---');
        console.table(goals);

        conn.release();
        process.exit(0);
    } catch (e) {
        console.error('QueryErr', e.message);
        conn.release();
        process.exit(1);
    }
}).catch(e => {
    console.error('ConnErr', e.message);
    process.exit(1);
});

