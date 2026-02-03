const pool = require('../config/database');

const argv = process.argv.slice(2);

if (argv.length < 2) {
  console.error('Usage: node create_admin.js <email> <password>');
  process.exit(1);
}

const [email, password] = argv;

async function main() {
  const connection = await pool.getConnection();
  try {
    // Check for existing user
    const [existing] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing && existing.length > 0) {
      // Update role to admin and set password
      await connection.query('UPDATE users SET password = ?, role = ? WHERE email = ?', [password, 'admin', email]);
      console.log(`Updated existing user ${email} to admin and set password.`);
    } else {
      // Insert new admin user
      const [res] = await connection.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, password, 'admin']);
      console.log(`Created admin user with user_id = ${res.insertId} and email = ${email}`);
    }
  } catch (err) {
    console.error('Error creating/updating admin:', err.message || err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

main();
