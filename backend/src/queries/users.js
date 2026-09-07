const db = require("../config/database");

async function createUser(name, email, passwordHash) {
    const [userId] = await db("users").insert({
        name: name,
        email: email,
        password_hash: passwordHash
    });

    return userId;
}

async function getUserById(userId) {
    return db("users")
        .where({ id: userId })
        .first();
}

async function getUserByEmail(email) {
    return db("users")
        .where({ email: email })
        .first();
}

module.exports = {
    createUser,
    getUserById,
    getUserByEmail
};