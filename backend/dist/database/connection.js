"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.connectDatabase = exports.pool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDatabase = async () => {
    try {
        exports.pool = promise_1.default.createPool({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        const connection = await exports.pool.getConnection();
        await connection.ping();
        connection.release();
    }
    catch (error) {
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const query = async (sql, params) => {
    if (!exports.pool)
        throw new Error('Database pool not initialized');
    const [results] = await exports.pool.execute(sql, params);
    return results;
};
exports.query = query;
//# sourceMappingURL=connection.js.map