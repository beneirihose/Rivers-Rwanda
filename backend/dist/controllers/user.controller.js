"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const connection_1 = require("../database/connection");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getProfile = async (req, res, next) => {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'No user ID in token' });
    }
    try {
        let profileData = null;
        let tableName = null;
        let extraFields = '';
        let alias = '';
        switch (role) {
            case 'client':
                tableName = 'clients';
                alias = 'c';
                break;
            case 'agent':
                tableName = 'agents';
                alias = 'a';
                extraFields = ', a.referral_code';
                break;
            case 'seller':
                tableName = 'sellers';
                alias = 's';
                break;
            case 'admin':
                tableName = 'admin_profiles';
                alias = 'ap';
                break;
        }
        if (tableName) {
            const sql = `
        SELECT u.email, u.role, u.status, 
               ${alias}.first_name, ${alias}.last_name, ${alias}.phone_number, ${alias}.profile_image
               ${extraFields} 
        FROM users u 
        LEFT JOIN ${tableName} ${alias} ON u.id = ${alias}.user_id 
        WHERE u.id = ?
      `;
            const results = await (0, connection_1.query)(sql, [userId]);
            profileData = results[0];
        }
        else {
            const fallbackSql = 'SELECT id, email, role, status FROM users WHERE id = ?';
            const results = await (0, connection_1.query)(fallbackSql, [userId]);
            profileData = results[0];
        }
        if (!profileData) {
            return res.status(404).json({ success: false, message: 'User record not found' });
        }
        res.status(200).json({
            success: true,
            data: {
                ...profileData,
                first_name: profileData.first_name || '',
                last_name: profileData.last_name || '',
                phone_number: profileData.phone_number || '',
                profile_image: profileData.profile_image || null
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        const body = req.body || {};
        const { firstName, lastName, phoneNumber } = body;
        const profileImage = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;
        if (!userId || !role) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const roleToTableMap = {
            client: 'clients',
            agent: 'agents',
            seller: 'sellers',
            admin: 'admin_profiles',
        };
        const table = roleToTableMap[role];
        if (!table) {
            return res.status(400).json({ success: false, message: 'Profile updates are not supported for this role.' });
        }
        const checkSql = `SELECT user_id FROM ${table} WHERE user_id = ?`;
        const existingProfile = await (0, connection_1.query)(checkSql, [userId]);
        if (existingProfile.length > 0) {
            const setClauses = [];
            const params = [];
            if (firstName !== undefined) {
                setClauses.push('first_name = ?');
                params.push(firstName);
            }
            if (lastName !== undefined) {
                setClauses.push('last_name = ?');
                params.push(lastName);
            }
            if (phoneNumber !== undefined) {
                setClauses.push('phone_number = ?');
                params.push(phoneNumber);
            }
            if (profileImage !== undefined) {
                setClauses.push('profile_image = ?');
                params.push(profileImage);
            }
            if (setClauses.length > 0) {
                params.push(userId);
                const updateSql = `UPDATE ${table} SET ${setClauses.join(', ')} WHERE user_id = ?`;
                await (0, connection_1.query)(updateSql, params);
            }
        }
        else {
            if (!firstName || !lastName) {
                return res.status(400).json({ success: false, message: 'First name and last name are required.' });
            }
            const insertSql = `INSERT INTO ${table} (id, user_id, first_name, last_name, phone_number, profile_image) VALUES (UUID(), ?, ?, ?, ?, ?)`;
            await (0, connection_1.query)(insertSql, [userId, firstName, lastName, phoneNumber || null, profileImage || null]);
        }
        res.status(200).json({ success: true, message: 'Profile updated successfully' });
    }
    catch (error) {
        console.error('[UPDATE PROFILE ERROR]:', error.message);
        next(error);
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const { currentPassword, newPassword } = req.body;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
        }
        // 1. Get user password hash
        const [user] = await (0, connection_1.query)('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // 2. Verify current password
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect current password' });
        }
        // 3. Hash new password and update
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await (0, connection_1.query)('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);
        res.status(200).json({ success: true, message: 'Password changed successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=user.controller.js.map