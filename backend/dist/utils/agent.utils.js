"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentId = void 0;
const connection_1 = require("../database/connection");
/**
 * Retrieves the agent ID associated with a given user ID.
 * @param userId The user ID of the agent.
 * @returns A promise that resolves to the agent ID string, or null if not found or on error.
 */
const getAgentId = async (userId) => {
    if (!userId)
        return null;
    try {
        const result = await (0, connection_1.query)('SELECT id FROM agents WHERE user_id = ?', [userId]);
        return result.length > 0 ? result[0].id : null;
    }
    catch (error) {
        console.error("Error fetching agent ID:", error);
        return null; // Return null to prevent crashing the caller
    }
};
exports.getAgentId = getAgentId;
//# sourceMappingURL=agent.utils.js.map