const {
    createGroup,
    getGroupById,
    getGroupsByUserId
} = require("../queries/groups");

const { addMember } = require("../queries/memberships");

async function createNewGroup(req, res) {
    try {
        const { name } = req.body;
        const userId = req.session.userId;

        if (!name) {
            return res.status(400).json({
                error: "Group name is required"
            });
        }

        const groupId = await createGroup(name, userId);

        await addMember(userId, groupId);

        return res.status(201).json({
            id: groupId,
            name: name,
            created_by: userId
        });
    } catch (error) {
        console.error("Create group error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

async function getMyGroups(req, res) {
    try {
        const userId = req.session.userId;

        const groups = await getGroupsByUserId(userId);

        return res.status(200).json(groups);
    } catch (error) {
        console.error("Get groups error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

async function getGroup(req, res) {
    try {
        const groupId = req.params.groupId;

        const group = await getGroupById(groupId);

        if (!group) {
            return res.status(404).json({
                error: "Group not found"
            });
        }

        return res.status(200).json(group);
    } catch (error) {
        console.error("Get group error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

module.exports = {
    createNewGroup,
    getMyGroups,
    getGroup
};