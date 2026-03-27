"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../database/connection");
const addColumnIfMissing = async (table, column, definition) => {
    try {
        await (0, connection_1.query)(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
        console.log(`Successfully added ${table}.${column} column.`);
    }
    catch (e) {
        if (e.code === 'ER_DUP_COLUMN_NAME') {
            // console.log(`Note: ${table}.${column} column already exists.`);
        }
        else {
            console.error(`Error adding ${column} to ${table}:`, e.message);
        }
    }
};
const fixSchema = async () => {
    try {
        await (0, connection_1.connectDatabase)();
        console.log("Connected to database. Applying fixes...");
        // 1. Make seller_id nullable
        await (0, connection_1.query)('ALTER TABLE houses MODIFY COLUMN seller_id CHAR(36) NULL').catch(() => { });
        await (0, connection_1.query)('ALTER TABLE accommodations MODIFY COLUMN seller_id CHAR(36) NULL').catch(() => { });
        await (0, connection_1.query)('ALTER TABLE vehicles MODIFY COLUMN seller_id CHAR(36) NULL').catch(() => { });
        // 2. Fix Accommodations Table Columns
        await addColumnIfMissing('accommodations', 'sub_type', "ENUM('whole', 'room') DEFAULT 'whole' AFTER type");
        await addColumnIfMissing('accommodations', 'bedrooms', "INT AFTER currency");
        await addColumnIfMissing('accommodations', 'bathrooms', "INT AFTER bedrooms");
        await addColumnIfMissing('accommodations', 'max_guests', "INT AFTER bathrooms");
        await addColumnIfMissing('accommodations', 'capacity', "INT AFTER max_guests");
        await addColumnIfMissing('accommodations', 'wifi', "BOOLEAN DEFAULT FALSE AFTER capacity");
        await addColumnIfMissing('accommodations', 'parking', "BOOLEAN DEFAULT FALSE AFTER wifi");
        await addColumnIfMissing('accommodations', 'garden', "BOOLEAN DEFAULT FALSE AFTER parking");
        await addColumnIfMissing('accommodations', 'decoration', "BOOLEAN DEFAULT FALSE AFTER garden");
        await addColumnIfMissing('accommodations', 'gym', "BOOLEAN DEFAULT FALSE AFTER decoration");
        await addColumnIfMissing('accommodations', 'kitchen', "BOOLEAN DEFAULT FALSE AFTER gym");
        await addColumnIfMissing('accommodations', 'toilet', "BOOLEAN DEFAULT FALSE AFTER kitchen");
        await addColumnIfMissing('accommodations', 'living_room', "BOOLEAN DEFAULT FALSE AFTER toilet");
        await addColumnIfMissing('accommodations', 'swimming_pool', "BOOLEAN DEFAULT FALSE AFTER living_room");
        await addColumnIfMissing('accommodations', 'floor_number', "INT AFTER swimming_pool");
        await addColumnIfMissing('accommodations', 'room_name_number', "VARCHAR(100) AFTER floor_number");
        await addColumnIfMissing('accommodations', 'bed_type', "ENUM('single', 'double', 'triple', 'other') AFTER room_name_number");
        await addColumnIfMissing('accommodations', 'has_elevator', "BOOLEAN DEFAULT FALSE AFTER bed_type");
        await addColumnIfMissing('accommodations', 'is_furnished', "BOOLEAN DEFAULT FALSE AFTER has_elevator");
        console.log("Database fixes completed.");
        process.exit(0);
    }
    catch (error) {
        console.error("Failed to apply database fixes:", error);
        process.exit(1);
    }
};
fixSchema();
//# sourceMappingURL=fix_db_schema.js.map