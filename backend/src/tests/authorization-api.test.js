import { describe, it, expect } from "vitest";
import request from "supertest";

const app = require("../server");

async function loginAsNonMember() {
    const agent = request.agent(app);

    const loginResponse = await agent
        .post("/api/auth/login")
        .send({
            email: "authtest@example.com",
            password: "password123"
        });

    expect(loginResponse.status).toBe(200);

    return agent;
}

describe("Authorization API", () => {
    it("should reject access to a group when user is not a member", async () => {
        const agent = await loginAsNonMember();

        const response = await agent
            .get("/api/groups/5");

        expect(response.status).toBe(403);

        expect(response.body.error).toBe(
            "You are not a member of this group"
        );
    });

    it("should reject viewing group members when user is not a member", async () => {
        const agent = await loginAsNonMember();

        const response = await agent
            .get("/api/groups/5/members");

        expect(response.status).toBe(403);

        expect(response.body.error).toBe(
            "You are not a member of this group"
        );
    });

    it("should reject adding a group member when user is not a member", async () => {
        const agent = await loginAsNonMember();

        const response = await agent
            .post("/api/groups/5/members")
            .send({
                user_id: 54
            });

        expect(response.status).toBe(403);

        expect(response.body.error).toBe(
            "You are not a member of this group"
        );
    });

    it("should reject removing a group member when user is not a member", async () => {
        const agent = await loginAsNonMember();

        const response = await agent
            .delete("/api/groups/5/members/1");

        expect(response.status).toBe(403);

        expect(response.body.error).toBe(
            "You are not a member of this group"
        );
    });

    it("should reject viewing expenses when user is not a member", async () => {
        const agent = await loginAsNonMember();

        const response = await agent
            .get("/api/groups/5/expenses");

        expect(response.status).toBe(403);

        expect(response.body.error).toBe(
            "You are not a member of this group"
        );
    });

    it("should reject creating an expense when user is not a member", async () => {
        const agent = await loginAsNonMember();

        const response = await agent
            .post("/api/groups/5/expenses")
            .send({
                paid_by: 54,
                description: "Unauthorized Expense",
                amount: "100.00",
                expense_date: "2026-09-13",
                split_type: "equal",
                splits: [
                    {
                        user_id: 54
                    }
                ]
            });

        expect(response.status).toBe(403);

        expect(response.body.error).toBe(
            "You are not a member of this group"
        );
    });

    it("should reject viewing balances when user is not a member", async () => {
        const agent = await loginAsNonMember();

        const response = await agent
            .get("/api/groups/5/balances");

        expect(response.status).toBe(403);

        expect(response.body.error).toBe(
            "You are not a member of this group"
        );
    });

    it("should reject viewing settlements when user is not a member", async () => {
        const agent = await loginAsNonMember();

        const response = await agent
            .get("/api/groups/5/settlements");

        expect(response.status).toBe(403);

        expect(response.body.error).toBe(
            "You are not a member of this group"
        );
    });

    it("should reject recording a settlement when user is not a member", async () => {
        const agent = await loginAsNonMember();

        const response = await agent
            .post("/api/groups/5/settlements")
            .send({
                paid_by: 54,
                paid_to: 1,
                amount: "100.00"
            });

        expect(response.status).toBe(403);

        expect(response.body.error).toBe(
            "You are not a member of this group"
        );
    });
});