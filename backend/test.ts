import { query } from './src/database/connection';

async function check() {
  const b = await query('SELECT id, total_amount, agent_id, house_id, accommodation_id, vehicle_id FROM bookings ORDER BY created_at DESC LIMIT 5');
  console.log("Bookings:", b);
  const a = await query('SELECT * FROM commissions ORDER BY earned_at DESC');
  console.log("Commissions:", a);
  process.exit(0);
}
check();
