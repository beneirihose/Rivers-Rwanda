"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSeller = exports.findSellerById = exports.createSeller = void 0;
const connection_1 = require("../database/connection");
const createSeller = async (sellerData) => {
    const sql = 'INSERT INTO sellers (id, user_id, first_name, last_name, phone_number, national_id, status) VALUES (UUID(), ?, ?, ?, ?, ?, "pending")';
    await (0, connection_1.query)(sql, [
        sellerData.user_id,
        sellerData.first_name,
        sellerData.last_name,
        sellerData.phone_number,
        sellerData.national_id
    ]);
    const result = await (0, connection_1.query)('SELECT id FROM sellers WHERE user_id = ?', [sellerData.user_id]);
    return result[0].id;
};
exports.createSeller = createSeller;
const findSellerById = async (id) => {
    const sql = 'SELECT * FROM sellers WHERE id = ?';
    const results = await (0, connection_1.query)(sql, [id]);
    return results[0] || null;
};
exports.findSellerById = findSellerById;
const updateSeller = async (id, data) => {
    const fields = Object.keys(data);
    if (fields.length === 0)
        return;
    let sql = 'UPDATE sellers SET ';
    const params = [];
    fields.forEach((field, index) => {
        sql += `${field} = ?${index === fields.length - 1 ? '' : ', '}`;
        params.push(data[field]);
    });
    sql += ' WHERE id = ?';
    params.push(id);
    await (0, connection_1.query)(sql, params);
};
exports.updateSeller = updateSeller;
//# sourceMappingURL=Seller.model.js.map