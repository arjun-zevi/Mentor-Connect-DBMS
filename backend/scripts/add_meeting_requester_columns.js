const pool = require('../config/database');

(async function() {
  const conn = await pool.getConnection();
  try {
    console.log('Checking meetings table columns...');
    // Add columns if they do not exist
    const alterSqls = [
      `ALTER TABLE meetings ADD COLUMN IF NOT EXISTS requested_by_user_id INT DEFAULT NULL`,
      `ALTER TABLE meetings ADD COLUMN IF NOT EXISTS requested_by_role VARCHAR(50) DEFAULT NULL`,
      `ALTER TABLE meetings ADD COLUMN IF NOT EXISTS requested_by_name VARCHAR(255) DEFAULT NULL`
    ];
    for (const sql of alterSqls) {
      try {
        await conn.query(sql);
        console.log('Executed:', sql);
      } catch (err) {
        // MySQL older versions don't support IF NOT EXISTS on ADD COLUMN, handle gracefully
        if (err && err.code === 'ER_DUP_FIELDNAME') {
          console.log('Column already exists, skipping.');
        } else if (err && err.errno) {
          // Try a fallback: check information_schema
          const colMatch = sql.match(/ADD COLUMN IF NOT EXISTS\s+([a-zA-Z0-9_]+)/i);
          if (colMatch) {
            const col = colMatch[1];
            const [rows] = await conn.query('SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = "meetings" AND COLUMN_NAME = ?', [col]);
            if (rows && rows.length) {
              console.log('Column', col, 'already exists, skipping.');
              continue;
            }
          }
          // If not due to existing column, try a normal ADD COLUMN without IF NOT EXISTS
          const altSql = sql.replace('ADD COLUMN IF NOT EXISTS ', 'ADD COLUMN ');
          try {
            await conn.query(altSql);
            console.log('Executed fallback:', altSql);
          } catch (err2) {
            console.error('Failed to execute SQL:', altSql, err2.message || err2);
          }
        } else {
          console.error('Error altering table:', err.message || err);
        }
      }
    }
    console.log('Done.');
  } catch (err) {
    console.error('Script error:', err.message || err);
  } finally {
    conn.release();
    process.exit(0);
  }
})();
