import { query } from '../database/connection';
import { RowDataPacket } from 'mysql2';

export interface Accommodation extends RowDataPacket {
  id: string;
  seller_id: string | null;
  type: 'apartment' | 'hotel_room' | 'event_hall';
  purpose: 'rent' | 'sale' | 'both';
  name: string;
  description: string;
  city: string;
  district: string;
  price_per_night?: number;
  price_per_event?: number;
  sale_price?: number;
  max_guests?: number;
  capacity?: number;
  wifi: boolean;
  parking: boolean;
  garden: boolean;
  decoration: boolean;
  floor_number?: number;
  has_elevator?: boolean;
  is_furnished?: boolean;
  status: 'pending_approval' | 'available' | 'unavailable' | 'maintenance' | 'rejected';
  images: any;
  amenities: any;
  created_at: Date;
}

export const getAllAccommodations = async (filters: any): Promise<Accommodation[]> => {
  let sql = 'SELECT * FROM accommodations WHERE 1=1';
  const params: any[] = [];

  if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
  } else {
      // Default public view: Only show available accommodations
      sql += " AND status = 'available'";
  }

  if (filters.type) {
    sql += ' AND type = ?';
    params.push(filters.type);
  }

  if (filters.city) {
    sql += ' AND city = ?';
    params.push(filters.city);
  }

  if (filters.purpose) {
    sql += ' AND (purpose = ? OR purpose = \'both\')';
    params.push(filters.purpose);
  }

  sql += ' ORDER BY created_at DESC';

  return await query<Accommodation[]>(sql, params);
};

export const getAccommodationById = async (id: string): Promise<Accommodation | null> => {
  const sql = 'SELECT * FROM accommodations WHERE id = ?';
  const results = await query<Accommodation[]>(sql, [id]);
  return results[0] || null;
};

const toInt = (val: any) => (['true', true, 1, '1', 'on'].includes(val) ? 1 : 0);

export const createAccommodation = async (data: any): Promise<string> => {
  const sql = `
    INSERT INTO accommodations (
      id, seller_id, type, purpose, name, description, 
      city, district, price_per_night, price_per_event, sale_price,
      max_guests, capacity, wifi, parking, garden, decoration,
      floor_number, has_elevator, is_furnished,
      status, images, amenities
    )
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await query(sql, [
    data.seller_id || null,
    data.type,
    data.purpose || 'rent',
    data.name,
    data.description,
    data.city,
    data.district,
    data.price_per_night || null,
    data.price_per_event || null,
    data.sale_price || null,
    data.max_guests || null,
    data.capacity || null,
    toInt(data.wifi),
    toInt(data.parking),
    toInt(data.garden),
    toInt(data.decoration),
    data.floor_number || null,
    toInt(data.has_elevator),
    toInt(data.is_furnished),
    data.status || 'pending_approval',
    data.images || JSON.stringify([]),
    data.amenities || JSON.stringify([])
  ]);
  
  const [result] = await query<any[]>('SELECT id FROM accommodations ORDER BY created_at DESC LIMIT 1');
  return result.id;
};

export const updateAccommodation = async (id: string, data: any): Promise<void> => {
  const fields = Object.keys(data).filter(f => f !== 'id' && f !== 'existingImages');
  if (fields.length === 0) return;

  let sql = 'UPDATE accommodations SET ';
  const params: any[] = [];
  
  const boolFields = ['wifi', 'parking', 'garden', 'decoration', 'has_elevator', 'is_furnished'];

  fields.forEach((field, index) => {
    sql += `${field} = ?${index === fields.length - 1 ? '' : ', '}`;
    if (boolFields.includes(field)) {
        params.push(toInt(data[field]));
    } else {
        params.push(data[field]);
    }
  });
  
  sql += ' WHERE id = ?';
  params.push(id);
  
  await query(sql, params);
};

export const updateAccommodationStatus = async (id: string, status: string): Promise<void> => {
  const sql = 'UPDATE accommodations SET status = ? WHERE id = ?';
  await query(sql, [status, id]);
};

export const deleteAccommodation = async (id: string): Promise<void> => {
  const sql = 'DELETE FROM accommodations WHERE id = ?';
  await query(sql, [id]);
};
