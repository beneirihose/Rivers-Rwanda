import { query } from '../database/connection';
import { RowDataPacket } from 'mysql2';

export interface House extends RowDataPacket {
  id: string;
  title: string;
  description: string;
  size: string;
  total_rooms: number;
  bedrooms: number;
  bathrooms: number;
  has_parking: boolean;
  has_garden: boolean;
  has_wifi: boolean;
  amenities: any;
  images: any;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  full_address: string;
  monthly_rent_price?: number;
  purchase_price?: number;
  status: 'available' | 'under maintenance' | 'rented' | 'purchased';
  contact_info: any;
  created_at: Date;
}

export const getAllHouses = async (filters: any): Promise<House[]> => {
  let sql = 'SELECT * FROM houses WHERE 1=1';
  const params: any[] = [];

  if (filters.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters.province) {
    sql += ' AND province = ?';
    params.push(filters.province);
  }

  if (filters.district) {
    sql += ' AND district = ?';
    params.push(filters.district);
  }

  return await query<House[]>(sql, params);
};

export const getHouseById = async (id: string): Promise<House | null> => {
  const sql = 'SELECT * FROM houses WHERE id = ?';
  const results = await query<House[]>(sql, [id]);
  return results[0] || null;
};

export const createHouse = async (data: any): Promise<string> => {
  const sql = `
    INSERT INTO houses (id, title, description, size, total_rooms, bedrooms, bathrooms, has_parking, has_garden, has_wifi, amenities, images, province, district, sector, cell, village, full_address, monthly_rent_price, purchase_price, status, contact_info)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await query(sql, [
    data.title,
    data.description,
    data.size,
    data.total_rooms,
    data.bedrooms,
    data.bathrooms,
    data.has_parking,
    data.has_garden,
    data.has_wifi,
    data.amenities || JSON.stringify([]),
    data.images || JSON.stringify([]),
    data.province,
    data.district,
    data.sector,
    data.cell,
    data.village,
    data.full_address,
    data.monthly_rent_price || null,
    data.purchase_price || null,
    data.status || 'available',
    data.contact_info || JSON.stringify({})
  ]);
  
  const result = await query<any[]>('SELECT id FROM houses ORDER BY created_at DESC LIMIT 1');
  return result[0].id;
};

export const updateHouse = async (id: string, data: any): Promise<void> => {
  const fields = Object.keys(data);
  if (fields.length === 0) return;

  let sql = 'UPDATE houses SET ';
  const params: any[] = [];
  
  fields.forEach((field, index) => {
    sql += `${field} = ?${index === fields.length - 1 ? '' : ', '}`;
    params.push(data[field]);
  });
  
  sql += ' WHERE id = ?';
  params.push(id);
  
  await query(sql, params);
};

export const deleteHouse = async (id: string): Promise<void> => {
  const sql = 'DELETE FROM houses WHERE id = ?';
  await query(sql, [id]);
};
