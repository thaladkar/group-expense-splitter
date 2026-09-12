import { describe, it, expect } from "vitest";
import request from "supertest";

const app = require("../server");

describe("Session Management", () => {
    it("should create a secure session cookie after login", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "groupowner@example.com",
                password: "password123"
            });

        expect(response.status).toBe(200);

        const cookies = response.headers["set-cookie"];

        expect(cookies).toBeDefined();

        const sessionCookie = cookies[0];

        expect(sessionCookie).toContain("connect.sid=");
        expect(sessionCookie).toContain("HttpOnly");
        expect(sessionCookie).toContain("SameSite=Lax");
        expect(sessionCookie).toContain("Expires=");
    });

    it("should keep the user authenticated while the session is active", async () => {
        const agent = request.agent(app);

        const loginResponse = await agent
            .post("/api/auth/login")
            .send({
                email: "groupowner@example.com",
                password: "password123"
            });

        expect(loginResponse.status).toBe(200);

        const response = await agent
            .get("/api/groups");

        expect(response.status).toBe(200);
    });

    it("should logout the user successfully", async () => {
        const agent = request.agent(app);

        const loginResponse = await agent
            .post("/api/auth/login")
            .send({
                email: "groupowner@example.com",
                password: "password123"
            });

        expect(loginResponse.status).toBe(200);

        const logoutResponse = await agent
            .post("/api/auth/logout");

        expect(logoutResponse.status).toBe(200);

        expect(logoutResponse.body.message).toBe(
            "Logout successful"
        );
    });

    it("should reject access to protected routes after logout", async () => {
        const agent = request.agent(app);

        const loginResponse = await agent
            .post("/api/auth/login")
            .send({
                email: "groupowner@example.com",
                password: "password123"
            });

        expect(loginResponse.status).toBe(200);

        const beforeLogout = await agent
            .get("/api/groups");

        expect(beforeLogout.status).toBe(200);

        const logoutResponse = await agent
            .post("/api/auth/logout");

        expect(logoutResponse.status).toBe(200);

        const afterLogout = await agent
            .get("/api/groups");

        expect(afterLogout.status).toBe(401);

        expect(afterLogout.body.error).toBe(
            "Authentication required"
        );
    });
});