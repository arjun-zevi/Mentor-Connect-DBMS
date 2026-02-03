const pool = require('../config/database');

async function run(){
  let conn;
  try{
    conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT s.student_id, s.name, s.roll_number, s.email, a.assignment_id FROM students s LEFT JOIN assignments a ON s.student_id = a.student_id AND a.status = 'active' ORDER BY s.name");
    console.table(rows);
  }catch(e){
    console.error('Error:', e.message);
  }finally{
    if(conn) conn.release();
    process.exit(0);
  }
}

run();
