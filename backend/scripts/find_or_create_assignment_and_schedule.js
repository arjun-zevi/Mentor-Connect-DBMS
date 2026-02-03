const pool = require('../config/database');
const argv = process.argv.slice(2);

if (argv.length < 7) {
  console.error('Usage: node find_or_create_assignment_and_schedule.js <mentor_id> <student_id> <meeting_date(YYYY-MM-DD)> <meeting_time(HH:MM[:SS])> <duration_minutes> <mode(online|offline)> <location> [assignment_id]');
  process.exit(1);
}

const [mentorIdStr, studentIdStr, meeting_date, meeting_time, durationStr, mode, location, assignmentIdStr] = argv;
const mentor_id = parseInt(mentorIdStr, 10);
const student_id = parseInt(studentIdStr, 10);
const duration = parseInt(durationStr, 10);
const providedAssignmentId = assignmentIdStr ? parseInt(assignmentIdStr, 10) : null;

async function main() {
  const connection = await pool.getConnection();
  try {
    let assignment_id = providedAssignmentId;

    if (assignment_id) {
      // verify it exists and matches
      const [rows] = await connection.query('SELECT assignment_id, mentor_id, student_id, status FROM assignments WHERE assignment_id = ?', [assignment_id]);
      if (!rows || rows.length === 0) {
        throw new Error(`Provided assignment_id ${assignment_id} not found`);
      }
      const a = rows[0];
      if (a.mentor_id !== mentor_id || a.student_id !== student_id) {
        throw new Error(`Provided assignment_id ${assignment_id} does not match mentor_id ${mentor_id} and student_id ${student_id}`);
      }
      if (a.status !== 'active') {
        throw new Error(`Provided assignment_id ${assignment_id} is not active (status=${a.status})`);
      }
    } else {
      // find active assignment
      const [rows] = await connection.query('SELECT assignment_id, status FROM assignments WHERE mentor_id = ? AND student_id = ? LIMIT 1', [mentor_id, student_id]);
      if (rows && rows.length > 0) {
        assignment_id = rows[0].assignment_id;
        if (rows[0].status !== 'active') {
          console.log(`Found assignment ${assignment_id} but status=${rows[0].status}`);
        } else {
          console.log(`Found active assignment ${assignment_id}`);
        }
      } else {
        // create assignment
        const [res] = await connection.query('INSERT INTO assignments (mentor_id, student_id, start_date, status) VALUES (?, ?, CURDATE(), ?)', [mentor_id, student_id, 'active']);
        assignment_id = res.insertId;
        console.log(`Created new assignment ${assignment_id} for mentor ${mentor_id} and student ${student_id}`);
      }
    }

    // final check
    const [check] = await connection.query('SELECT status FROM assignments WHERE assignment_id = ?', [assignment_id]);
    if (!check || check.length === 0) throw new Error('Unexpected: assignment disappeared');
    if (check[0].status !== 'active') throw new Error(`Assignment ${assignment_id} is not active (status=${check[0].status})`);

    // insert meeting
    const [result] = await connection.query(`INSERT INTO meetings (assignment_id, mentor_id, student_id, meeting_date, meeting_time, duration, mode, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')`, [assignment_id, mentor_id, student_id, meeting_date, meeting_time, duration, mode, location]);

    console.log('Meeting scheduled successfully. meeting_id =', result.insertId);
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

main();
