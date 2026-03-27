"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccommodation = exports.updateAccommodationStatus = exports.updateAccommodation = exports.createAccommodation = exports.getAccommodationById = exports.getAllAccommodations = void 0;
const connection_1 = require("../database/connection");
const getAllAccommodations = async (filters) => {
    let sql = 'SELECT * FROM accommodations WHERE 1=1';
    const params = [];
    if (filters.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
    }
    else {
        // Default public view: Only show available accommodations
        sql += " AND status = 'available'";
    }
    if (filters.type) {
        sql += ' AND type = ?';
        params.push(filters.type);
    }
    if (filters.sub_type) {
        sql += ' AND sub_type = ?';
        params.push(filters.sub_type);
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
    return await (0, connection_1.query)(sql, params);
};
exports.getAllAccommodations = getAllAccommodations;
const getAccommodationById = async (id) => {
    const sql = 'SELECT * FROM accommodations WHERE id = ?';
    const results = await (0, connection_1.query)(sql, [id]);
    return results[0] || null;
};
exports.getAccommodationById = getAccommodationById;
const toInt = (val) => (['true', true, 1, '1', 'on'].includes(val) ? 1 : 0);
const createAccommodation = async (data) => {
    const sql = `
    INSERT INTO accommodations (
      id, seller_id, type, sub_type, purpose, name, description, 
      city, district, price_per_night, price_per_event, sale_price,
      wifi, parking, garden, decoration, sonolization,
      gym, kitchen, toilet, living_room, swimming_pool,
      number_of_living_rooms, floor_number, room_name_number, bed_type,
      has_elevator, is_furnished, status, images, amenities
    )
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    await (0, connection_1.query)(sql, [
        data.seller_id || null,
        data.type,
        data.sub_type || 'whole',
        data.purpose || 'rent',
        data.name,
        data.description,
        data.city,
        data.district,
        data.price_per_night || null,
        data.price_per_event || null,
        data.sale_price || null,
        toInt(data.wifi),
        toInt(data.parking),
        toInt(data.garden),
        toInt(data.decoration),
        toInt(data.sonolization),
        toInt(data.gym),
        toInt(data.kitchen),
        toInt(data.toilet),
        toInt(data.living_room),
        toInt(data.swimming_pool),
        data.number_of_living_rooms || null,
        data.floor_number || null,
        data.room_name_number || null,
        data.bed_type || null,
        toInt(data.has_elevator),
        toInt(data.is_furnished),
        data.status || 'pending_approval',
        data.images || JSON.stringify([]),
        data.amenities || JSON.stringify([])
    ]);
    const [result] = await (0, connection_1.query)('SELECT id FROM accommodations ORDER BY created_at DESC LIMIT 1');
    return result.id;
};
exports.createAccommodation = createAccommodation;
const updateAccommodation = async (id, data) => {
    const fields = Object.keys(data).filter(f => f !== 'id' && f !== 'existingImages');
    if (fields.length === 0)
        return;
    let sql = 'UPDATE accommodations SET ';
    const params = [];
    const boolFields = [
        'wifi', 'parking', 'garden', 'decoration', 'sonolization', 'gym', 'kitchen',
        'toilet', 'living_room', 'swimming_pool', 'has_elevator', 'is_furnished'
    ];
    fields.forEach((field, index) => {
        sql += `${field} = ?${index === fields.length - 1 ? '' : ', '}`;
        if (boolFields.includes(field)) {
            params.push(toInt(data[field]));
        }
        else {
            params.push(data[field]);
        }
    });
    sql += ' WHERE id = ?';
    params.push(id);
    await (0, connection_1.query)(sql, params);
};
exports.updateAccommodation = updateAccommodation;
const updateAccommodationStatus = async (id, status) => {
    const sql = 'UPDATE accommodations SET status = ? WHERE id = ?';
    await (0, connection_1.query)(sql, [status, id]);
};
exports.updateAccommodationStatus = updateAccommodationStatus;
const deleteAccommodation = async (id) => {
    const sql = 'DELETE FROM accommodations WHERE id = ?';
    await (0, connection_1.query)(sql, [id]);
};
exports.deleteAccommodation = deleteAccommodation;
//# sourceMappingURL=Accommodation.model.js.map