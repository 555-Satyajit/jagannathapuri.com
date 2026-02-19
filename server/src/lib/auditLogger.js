const prisma = require('./prisma');

/**
 * Logs an admin action to the database.
 * 
 * @param {Object} req - The Express request object (must contain req.user or req.session.admin)
 * @param {string} action - The action name (e.g., 'CREATE_PRODUCT', 'DELETE_ORDER')
 * @param {string} [entity] - The entity type (e.g., 'Product', 'Order')
 * @param {string} [entityId] - The ID of the entity
 * @param {string|Object} [details] - Additional details about the action
 */
const logAction = async (req, action, entity = null, entityId = null, details = null) => {
    try {
        let adminId = null;

        // Try to get admin ID from session (Primary source for Admin Panel)
        if (req.session && req.session.admin && req.session.admin.id) {
            adminId = req.session.admin.id;
        }
        // Fallback to req.user (if using passport or similar middleware)
        else if (req.user && req.user.id) {
            adminId = req.user.id;
        }

        if (!adminId) {
            console.warn(`[AuditLog] Skipped: No admin ID found for action ${action}. Session:`, req.session ? 'exists' : 'missing');
            return;
        }

        // Format details
        let detailsStr = details;
        if (typeof details === 'object') {
            try {
                detailsStr = JSON.stringify(details);
            } catch (e) {
                detailsStr = String(details);
            }
        }

        await prisma.auditLog.create({
            data: {
                adminId,
                action,
                entity,
                entityId: entityId ? String(entityId) : null,
                details: detailsStr,
                ipAddress: req.ip || req.connection.remoteAddress
            }
        });

    } catch (error) {
        console.error('[AuditLog] Failed to create audit log:', error.message);
        // Don't throw error to prevent blocking the main action
    }
};

module.exports = { logAction };
