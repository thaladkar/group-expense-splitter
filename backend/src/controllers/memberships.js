const {
    addMember,
    removeMember,
    getGroupMembers,
    isUserMember
} = require("../queries/memberships");

const { getUserById } = require("../queries/users");

async function addGroupMember(req, res) {
    try {
        const groupId = req.params.groupId;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                error: "user_id is required"
            });
        }

        const user = await getUserById(user_id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const alreadyMember = await isUserMember(user_id, groupId);

        if (alreadyMember) {
            return res.status(409).json({
                error: "User is already a member of this group"
            });
        }

        const membershipId = await addMember(user_id, groupId);

        return res.status(201).json({
            id: membershipId,
            user_id: user_id,
            group_id: Number(groupId)
        });
    } catch (error) {
        console.error("Add member error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

async function removeGroupMember(req, res) {
    try {
        const groupId = req.params.groupId;
        const userId = req.params.userId;

        const member = await isUserMember(userId, groupId);

        if (!member) {
            return res.status(404).json({
                error: "User is not a member of this group"
            });
        }

        await removeMember(userId, groupId);

        return res.status(200).json({
            message: "Member removed successfully"
        });
    } catch (error) {
        console.error("Remove member error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

async function getMembers(req, res) {
    try {
        const groupId = req.params.groupId;

        const members = await getGroupMembers(groupId);

        return res.status(200).json(members);
    } catch (error) {
        console.error("Get members error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

module.exports = {
    addGroupMember,
    removeGroupMember,
    getMembers
};