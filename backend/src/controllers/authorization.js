const { isUserMember } = require("../queries/memberships");

function requireAuthentication(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "Authentication required"
        });
    }

    next();
}

async function checkGroupMembership(req, res, next) {
    try {
        const userId = req.session.userId;
        const groupId = req.params.groupId;

        const member = await isUserMember(userId, groupId);

        if (!member) {
            return res.status(403).json({
                error: "You are not a member of this group"
            });
        }

        next();
    } catch (error) {
        console.error("Authorization error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

module.exports = {
    requireAuthentication,
    checkGroupMembership
};