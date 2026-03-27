import { connectDatabase, query } from './src/database/connection';
async function test() {
  try {
    await connectDatabase();
    const [booking] = await query<any[]>('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 1');
    console.log('Last Booking:', booking);
    
    if (booking?.house_id) {
        const [house] = await query<any[]>('SELECT * FROM houses WHERE id = ?', [booking.house_id]);
        console.log('House:', house);
    } else if (booking?.vehicle_id) {
        const [vehicle] = await query<any[]>('SELECT * FROM vehicles WHERE id = ?', [booking.vehicle_id]);
        console.log('Vehicle:', vehicle);
    }
  } catch(e) { console.error('Error:', e); }
  process.exit(0);
}
test();
