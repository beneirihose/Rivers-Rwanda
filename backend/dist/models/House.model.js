"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHouse = exports.updateHouseStatus = exports.updateHouse = exports.createHouse = exports.getHouseById = exports.getAllHouses = void 0;
const connection_1 = require("../database/connection");
const getAllHouses = async (filters) => {
    let sql = 'SELECT * FROM houses WHERE 1=1';
    const params = [];
    if (filters.status && filters.status !== 'all') {
        sql += ' AND status = ?';
        params.push(filters.status);
    }
    else if (!filters.status) {
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
    }
    else if (filters.purpose === 'purchase' || filters.purpose === 'sale') {
        sql += ' AND (purpose = \'sale\' OR purpose = \'both\')';
    }
    sql += ' ORDER BY created_at DESC';
    return await (0, connection_1.query)(sql, params);
};
exports.getAllHouses = getAllHouses;
const getHouseById = async (id) => {
    const sql = 'SELECT * FROM houses WHERE id = ?';
    const results = await (0, connection_1.query)(sql, [id]);
    return results[0] || null;
};
exports.getHouseById = getHouseById;
const toInt = (val) => (['true', true, 1, '1', 'on'].includes(val) ? 1 : 0);
const createHouse = async (data) => {
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
    await (0, connection_1.query)(sql, params);
    const [result] = await (0, connection_1.query)('SELECT id FROM houses ORDER BY created_at DESC LIMIT 1');
    return result.id;
};
exports.createHouse = createHouse;
const updateHouse = async (id, data) => {
    const fields = Object.keys(data).filter(f => f !== 'id');
    if (fields.length === 0)
        return;
    let sql = 'UPDATE houses SET ';
    const params = [];
    fields.forEach((field, index) => {
        sql += `${field} = ?${index === fields.length - 1 ? '' : ', '}`;
        const booleanFields = ['has_parking', 'has_garden', 'has_wifi', 'has_tiles', 'has_electricity', 'has_water'];
        if (booleanFields.includes(field)) {
            params.push(toInt(data[field]));
        }
        else {
            params.push(data[field] ?? null);
        }
    });
    sql += ' WHERE id = ?';
    params.push(id);
    await (0, connection_1.query)(sql, params);
};
exports.updateHouse = updateHouse;
const updateHouseStatus = async (id, status) => {
    const sql = 'UPDATE houses SET status = ? WHERE id = ?';
    await (0, connection_1.query)(sql, [status, id]);
};
exports.updateHouseStatus = updateHouseStatus;
const deleteHouse = async (id) => {
    const sql = 'DELETE FROM houses WHERE id = ?';
    await (0, connection_1.query)(sql, [id]);
};
exports.deleteHouse = deleteHouse;
//# sourceMappingURL=House.model.js.map