import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const [rows]: any = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 2');
    console.log('Bookings:', rows);

    for (const b of rows) {
      if (b.house_id) {
          const [h]: any = await pool.query('SELECT seller_id, title FROM houses WHERE id = ?', [b.house_id]);
          console.log('House Seller ID for', b.id, ':', h[0]?.seller_id);
      } else if (b.vehicle_id) {
          const [v]: any = await pool.query('SELECT seller_id, make FROM vehicles WHERE id = ?', [b.vehicle_id]);
          console.log('Vehicle Seller ID for', b.id, ':', v[0]?.seller_id);
      }
    }
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
