const db = require("../config/database");

async function createGroup(name, createdBy) {
    const [groupId] = await db("groups").insert({
        name: name,
        created_by: createdBy
    });

    return groupId;
}

async function getGroupById(groupId) {
    return db("groups")
        .where({ id: groupId })
        .first();
}

async function getGroupsByUserId(userId) {
    return db("groups")
        .join("memberships", "groups.id", "memberships.group_id")
        .where("memberships.user_id", userId)
        .select("groups.*");
}

module.exports = {
    createGroup,
    getGroupById,
    getGroupsByUserId
};