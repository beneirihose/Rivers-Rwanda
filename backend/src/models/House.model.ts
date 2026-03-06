import { query } from '../database/connection';
import { RowDataPacket } from 'mysql2';

export interface House extends RowDataPacket {
  id: string;
  seller_id: string | null;
  purpose: 'rent' | 'sale' | 'both';
  title: string;
  description: string;
  size_sqm: number;
  total_rooms: number;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  kitchen_type: 'inside' | 'outside' | 'both';
  toilet_type: 'inside' | 'outside' | 'both';
  material_used: 'block_sima' | 'ruriba' | 'mpunyu' | 'rukarakara' | 'other';
  ceiling_type: 'plafond' | 'roof' | 'none';
  has_tiles: boolean;
  has_electricity: boolean;
  has_water: boolean;
  has_parking: boolean;
  has_garden: boolean;
  has_wifi: boolean;
  amenities: any;
  images: any;
  province: string;
  district: string;
  sector: string;
  full_address: string;
  monthly_rent_price?: number;
  purchase_price?: number;
  status: 'pending_approval' | 'available' | 'under maintenance' | 'rented' | 'purchased' | 'rejected';
  created_at: Date;
}

export const getAllHouses = async (filters: any): Promise<House[]> => {
  let sql = 'SELECT * FROM houses WHERE 1=1'; 
  const params: any[] = [];

  if (filters.status && filters.status !== 'all') {
      sql += ' AND status = ?';
      params.push(filters.status);
  } else if (!filters.status) {
      // Default public view: Only show available houses
      sql += " AND status = 'available'";
  }

  if (filters.province) {
    sql += ' AND province = ?';
    params.push(filters.province);
  }

  if (filters.district) {
    sql += ' AND district = ?';
    params.push(filters.district);
  }

  if (filters.purpose === 'rent') {
    sql += ' AND (purpose = \'rent\' OR purpose = \'both\')';
  } else if (filters.purpose === 'purchase' || filters.purpose === 'sale') {
    sql += ' AND (purpose = \'sale\' OR purpose = \'both\')';
  }

  sql += ' ORDER BY created_at DESC';

  return await query<House[]>(sql, params);
};

export const getHouseById = async (id: string): Promise<House | null> => {
  const sql = 'SELECT * FROM houses WHERE id = ?';
  const results = await query<House[]>(sql, [id]);
  return results[0] || null;
};

const toInt = (val: any) => (['true', true, 1, '1', 'on'].includes(val) ? 1 : 0);

export const createHouse = async (data: any): Promise<string> => {
  const sql = `
    INSERT INTO houses (
      id, seller_id, purpose, title, description, size_sqm, total_rooms, 
      bedrooms, bathrooms, balconies, kitchen_type, toilet_type, 
      material_used, ceiling_type, has_tiles, has_electricity, 
      has_water, has_parking, has_garden, has_wifi, 
      amenities, images, province, district, sector, full_address, 
      monthly_rent_price, purchase_price, status
    )
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    data.seller_id ?? null,
    data.purpose || 'rent',
    data.title || '',
    data.description || '',
    data.size_sqm ?? null,
    data.total_rooms ?? 0,
    data.bedrooms ?? 0,
    data.bathrooms ?? 0,
    data.balconies ?? 0,
    data.kitchen_type || 'inside',
    data.toilet_type || 'inside',
    data.material_used || 'block_sima',
    data.ceiling_type || 'plafond',
    toInt(data.has_tiles),
    toInt(data.has_electricity),
    toInt(data.has_water),
    toInt(data.has_parking),
    toInt(data.has_garden),
    toInt(data.has_wifi),
    data.amenities || '[]',
    data.images || '[]',
    data.province ?? null,
    data.district ?? null,
    data.sector ?? null,
    data.full_address ?? null,
    data.monthly_rent_price ?? null,
    data.purchase_price ?? null,
    data.status || 'pending_approval'
  ];

  await query(sql, params);
  
  const [result] = await query<any[]>('SELECT id FROM houses ORDER BY created_at DESC LIMIT 1');
  return result.id;
};

export const updateHouse = async (id: string, data: any): Promise<void> => {
  const fields = Object.keys(data).filter(f => f !== 'id');
  if (fields.length === 0) return;

  let sql = 'UPDATE houses SET ';
  const params: any[] = [];
  
  fields.forEach((field, index) => {
    sql += `${field} = ?${index === fields.length - 1 ? '' : ', '}`;
    const booleanFields = ['has_parking', 'has_garden', 'has_wifi', 'has_tiles', 'has_electricity', 'has_water'];
    if (booleanFields.includes(field)) {
        params.push(toInt(data[field]));
    } else {
        params.push(data[field] ?? null);
    }
  });
  
  sql += ' WHERE id = ?';
  params.push(id);
  
  await query(sql, params);
};

export const updateHouseStatus = async (id: string, status: string): Promise<void> => {
  const sql = 'UPDATE houses SET status = ? WHERE id = ?';
  await query(sql, [status, id]);
};

export const deleteHouse = async (id: string): Promise<void> => {
  const sql = 'DELETE FROM houses WHERE id = ?';
  await query(sql, [id]);
};
