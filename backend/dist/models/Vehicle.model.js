"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVehicle = exports.updateVehicleStatus = exports.updateVehicle = exports.createVehicle = exports.getVehicleById = exports.getAllVehicles = void 0;
const connection_1 = require("../database/connection");
const getAllVehicles = async (filters) => {
    let sql = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];
    if (filters.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
    }
    else {
        // Default public view: Only show available vehicles
        sql += " AND status = 'available'";
    }
    if (filters.purpose) {
        sql += ' AND purpose = ?';
        params.push(filters.purpose);
    }
    if (filters.make) {
        sql += ' AND make = ?';
        params.push(filters.make);
    }
    return await (0, connection_1.query)(sql, params);
};
exports.getAllVehicles = getAllVehicles;
const getVehicleById = async (id) => {
    const sql = 'SELECT * FROM vehicles WHERE id = ?';
    const results = await (0, connection_1.query)(sql, [id]);
    return results[0] || null;
};
exports.getVehicleById = getVehicleById;
const createVehicle = async (data) => {
    const sql = `
    INSERT INTO vehicles (id, seller_id, purpose, make, model, year, vehicle_type, transmission, fuel_type, seating_capacity, daily_rate, sale_price, status, images)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    await (0, connection_1.query)(sql, [
        data.seller_id || null,
        data.purpose,
        data.make,
        data.model,
        data.year,
        data.vehicle_type,
        data.transmission,
        data.fuel_type,
        data.seating_capacity,
        data.daily_rate || null,
        data.sale_price || null,
        data.status || 'pending_approval',
        data.images || JSON.stringify([])
    ]);
    const [result] = await (0, connection_1.query)('SELECT id FROM vehicles ORDER BY created_at DESC LIMIT 1');
    return result.id;
};
exports.createVehicle = createVehicle;
const updateVehicle = async (id, data) => {
    const fields = Object.keys(data).filter(f => f !== 'id');
    if (fields.length === 0)
        return;
    let sql = 'UPDATE vehicles SET ';
    const params = [];
    fields.forEach((field, index) => {
        sql += `${field} = ?${index === fields.length - 1 ? '' : ', '}`;
        params.push(data[field]);
    });
    sql += ' WHERE id = ?';
    params.push(id);
    await (0, connection_1.query)(sql, params);
};
exports.updateVehicle = updateVehicle;
const updateVehicleStatus = async (id, status) => {
    const sql = 'UPDATE vehicles SET status = ? WHERE id = ?';
    await (0, connection_1.query)(sql, [status, id]);
};
exports.updateVehicleStatus = updateVehicleStatus;
const deleteVehicle = async (id) => {
    const sql = 'DELETE FROM vehicles WHERE id = ?';
    await (0, connection_1.query)(sql, [id]);
};
exports.deleteVehicle = deleteVehicle;
//# sourceMappingURL=Vehicle.model.js.map