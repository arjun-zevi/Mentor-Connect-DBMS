const pool = require('../config/database');

const EMAIL = process.argv[2] || 'hari@gmail.com';
const NEW_PASSWORD = process.argv[3] || 'parent123';

async function run() {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query('SELECT user_id, email, password, role FROM users WHERE email = ? LIMIT 1', [EMAIL]);
    if (!users || users.length === 0) {
      console.error('User not found:', EMAIL);
      return process.exit(1);
    }

    const user = users[0];
    console.log('Found user:', user);

    if (user.role !== 'parent') {
      await connection.query('UPDATE users SET role = ? WHERE user_id = ?', ['parent', user.user_id]);
      console.log('Updated role to parent');
    } else {
      console.log('Role already parent');
    }

    // Check parent profile
    const [parents] = await connection.query('SELECT parent_id, user_id, name, email FROM parents WHERE user_id = ? LIMIT 1', [user.user_id]);
    if (!parents || parents.length === 0) {
      const [ins] = await connection.query('INSERT INTO parents (user_id, name, email) VALUES (?, ?, ?)', [user.user_id, 'Hari', EMAIL]);
      console.log('Inserted parents row, id=', ins.insertId);
    } else {
      console.log('Parent profile exists:', parents[0]);
    }

    // Reset password (project uses plain text currently)
    await connection.query('UPDATE users SET password = ? WHERE user_id = ?', [NEW_PASSWORD, user.user_id]);
    console.log('Password reset to', NEW_PASSWORD);

    connection.release();

    // Test login via API using global fetch
    try {
      const r = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: NEW_PASSWORD })
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) {
        console.error('Login failed:', r.status, data || await r.text());
      } else {
        console.log('Login response:', data);
      }
    } catch (err) {
      console.error('Login request error:', err.message || err);
    }
  } catch (e) {
    console.error('Error:', e.message || e);
  } finally {
    try { connection && connection.release(); } catch (e) {}
    process.exit(0);
  }
}

run();
