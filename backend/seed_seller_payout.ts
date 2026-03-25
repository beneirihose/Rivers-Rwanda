import { connectDatabase, query } from './src/database/connection';
import { v4 as uuidv4 } from 'uuid';

async function run() {
    await connectDatabase();
    console.log('Connected to DB');

    // Find the first seller
    const sellers = await query<any[]>('SELECT id, user_id FROM sellers LIMIT 1');
    if (sellers.length === 0) {
        console.log('No sellers found');
        process.exit(1);
    }
    const seller = sellers[0];
    console.log('Using seller:', seller.id);

    // Find a booking
    const bookings = await query<any[]>('SELECT id FROM bookings LIMIT 1');
    if (bookings.length === 0) {
        console.log('No bookings found');
        process.exit(1);
    }
    const booking = bookings[0];

    // Create a 90% payout commission
    const commissionId = uuidv4();
    await query(`
        INSERT INTO commissions (id, booking_id, amount, commission_type, seller_id, status, earned_at)
        VALUES (?, ?, ?, ?, ?, 'approved', CURRENT_TIMESTAMP)
    `, [commissionId, booking.id, 50000, 'seller_payout', seller.id]);

    console.log('Successfully seeded a seller_payout commission for seller:', seller.id, ' amounting to 50000');
    process.exit(0);
}

run().catch(console.error);
