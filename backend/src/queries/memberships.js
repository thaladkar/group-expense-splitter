const db = require("../config/database");

async function addMember(userId, groupId) {
    const [membershipId] = await db("memberships").insert({
        user_id: userId,
        group_id: groupId
    });

    return membershipId;
}

async function removeMember(userId, groupId) {
    return db("memberships")
        .where({
            user_id: userId,
            group_id: groupId
        })
        .del();
}

async function getGroupMembers(groupId) {
    return db("users")
        .join("memberships", "users.id", "memberships.user_id")
        .where("memberships.group_id", groupId)
        .select(
            "users.id",
            "users.name",
            "users.email"
        );
}

async function isUserMember(userId, groupId) {
    const membership = await db("memberships")
        .where({
            user_id: userId,
            group_id: groupId
        })
        .first();

    return !!membership;
}

module.exports = {
    addMember,
    removeMember,
    getGroupMembers,
    isUserMember
};