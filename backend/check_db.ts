import { query } from './src/database/connection';

async function check() {
    try {
        const commissions = await query<any[]>('SELECT id, commission_type, amount, seller_id, status FROM commissions ORDER BY earned_at DESC');
        console.log("ALL COMMISSIONS:", JSON.stringify(commissions, null, 2));
        
        const sellers = await query<any[]>('SELECT id, first_name, last_name FROM sellers');
        console.log("SELLERS:", JSON.stringify(sellers, null, 2));

        const bookings = await query<any[]>('SELECT id, total_amount, seller_id FROM bookings ORDER BY created_at DESC LIMIT 5');
        console.log("RECENT BOOKINGS:", JSON.stringify(bookings, null, 2));

    } catch (err) {
        console.error("DB ERROR:", err);
    }
    process.exit(0);
}
check();
