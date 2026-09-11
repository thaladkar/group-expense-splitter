import { describe, it, expect } from "vitest";

describe("Registration Validation", () => {
    it("should reject registration when name is missing", async () => {
        const response = await fetch(
            "http://localhost:3000/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: "",
                    email: "test@example.com",
                    password: "Test1234"
                })
            }
        );

        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.errors.name).toBe("Name is required");
    });

    it("should reject registration when email is invalid", async () => {
        const response = await fetch(
            "http://localhost:3000/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: "Test User",
                    email: "invalid-email",
                    password: "Test1234"
                })
            }
        );

        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.errors.email).toBe(
            "Enter a valid email address"
        );
    });

    it("should reject registration when password is too short", async () => {
        const response = await fetch(
            "http://localhost:3000/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: "Test User",
                    email: "test@example.com",
                    password: "123"
                })
            }
        );

        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.errors.password).toBe(
            "Password must be at least 8 characters"
        );
    });
});

describe("Authentication", () => {
    it("should reject access to protected routes when not logged in", async () => {
        const response = await fetch(
            "http://localhost:3000/api/groups"
        );

        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe("Authentication required");
    });

    it("should reject group access when user is not a group member", async () => {
        // Log in as User 54
        const loginResponse = await fetch(
            "http://localhost:3000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: "authtest@example.com",
                    password: "password123"
                })
            }
        );

        expect(loginResponse.status).toBe(200);

        // Get the session cookie from the login response
        const setCookie = loginResponse.headers.get("set-cookie");

        expect(setCookie).toBeDefined();

        const sessionCookie = setCookie.split(";")[0];

        // Try to access Group 8.
        // User 54 is not a member of this group.
        const response = await fetch(
            "http://localhost:3000/api/groups/8",
            {
                headers: {
                    Cookie: sessionCookie
                }
            }
        );

        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe(
            "You are not a member of this group"
        );
    });
});

