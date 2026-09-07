const db = require("./config/database");

async function testConnection() {
    try {
        await db.raw("SELECT 1");
        console.log("Database connection successful");
    } catch (error) {
        console.error("Database connection failed:", error.message);
    } finally {
        await db.destroy();
    }
}

testConnection();