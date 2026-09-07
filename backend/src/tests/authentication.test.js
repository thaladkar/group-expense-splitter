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