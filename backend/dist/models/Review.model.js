"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewStatus = exports.getReviewsByTarget = exports.createReview = void 0;
const connection_1 = require("../database/connection");
const createReview = async (data) => {
    const sql = `
    INSERT INTO reviews (id, client_id, accommodation_id, vehicle_id, rating, comment, status)
    VALUES (UUID(), ?, ?, ?, ?, ?, 'pending')
  `;
    await (0, connection_1.query)(sql, [
        data.client_id,
        data.accommodation_id || null,
        data.vehicle_id || null,
        data.rating,
        data.comment
    ]);
};
exports.createReview = createReview;
const getReviewsByTarget = async (type, targetId) => {
    const column = type === 'accommodation' ? 'accommodation_id' : 'vehicle_id';
    const sql = `
    SELECT r.*, c.first_name, c.last_name 
    FROM reviews r 
    JOIN clients c ON r.client_id = c.id 
    WHERE r.${column} = ? AND r.status = 'approved' 
    ORDER BY r.created_at DESC
  `;
    return await (0, connection_1.query)(sql, [targetId]);
};
exports.getReviewsByTarget = getReviewsByTarget;
const updateReviewStatus = async (id, status) => {
    const sql = 'UPDATE reviews SET status = ? WHERE id = ?';
    await (0, connection_1.query)(sql, [status, id]);
};
exports.updateReviewStatus = updateReviewStatus;
//# sourceMappingURL=Review.model.js.map