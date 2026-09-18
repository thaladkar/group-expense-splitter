import { describe, it, expect } from "vitest";
import request from "supertest";

const app = require("../server");

describe("Registration Validation", () => {
    it("should reject registration when name is missing", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "",
                email: "test@example.com",
                password: "Test1234"
            });

        expect(response.status).toBe(400);
        expect(response.body.errors.name).toBe(
            "Name is required"
        );
    });

    it("should reject registration when email is invalid", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "invalid-email",
                password: "Test1234"
            });

        expect(response.status).toBe(400);
        expect(response.body.errors.email).toBe(
            "Enter a valid email address"
        );
    });

    it("should reject registration when password is too short", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "123"
            });

        expect(response.status).toBe(400);
        expect(response.body.errors.password).toBe(
            "Password must be at least 8 characters"
        );
    });
});

describe("Authentication", () => {
    it("should reject access to protected routes when not logged in", async () => {
        const response = await request(app)
            .get("/api/groups");

        expect(response.status).toBe(401);
        expect(response.body.error).toBe(
            "Authentication required"
        );
    });

    it("should reject group access when user is not a group member", async () => {
        const agent = request.agent(app);

        const loginResponse = await agent
            .post("/api/auth/login")
            .send({
                email: "authtest@example.com",
                password: "password123"
            });

        expect(loginResponse.status).toBe(200);

        const response = await agent
            .get("/api/groups/8");

        expect(response.status).toBe(403);
        expect(response.body.error).toBe(
            "You are not a member of this group"
        );
    });
});