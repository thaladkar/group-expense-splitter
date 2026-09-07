import { describe, it, expect } from "vitest";

const {
    createUser,
    getUserById,
    getUserByEmail
} = require("../queries/users");

describe("User Queries", () => {
    it("should create a user", async () => {
        const uniqueEmail = `test_${Date.now()}@example.com`;

        const userId = await createUser(
            "Test User",
            uniqueEmail,
            "hashedpassword"
        );

        expect(userId).toBeGreaterThan(0);
    });

    it("should get a user by ID", async () => {
        const uniqueEmail = `getuser_${Date.now()}@example.com`;

        const userId = await createUser(
            "Get User Test",
            uniqueEmail,
            "hashedpassword"
        );

        const user = await getUserById(userId);

        expect(user).toBeDefined();
        expect(user.id).toBe(userId);
    });

    it("should get a user by email", async () => {
        const uniqueEmail = `email_${Date.now()}@example.com`;

        await createUser(
            "Email User Test",
            uniqueEmail,
            "hashedpassword"
        );

        const user = await getUserByEmail(uniqueEmail);

        expect(user).toBeDefined();
        expect(user.email).toBe(uniqueEmail);
    });
});