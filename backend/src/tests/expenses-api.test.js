import { describe, it, expect } from "vitest";
import request from "supertest";

const app = require("../server");

const {
    deleteExpense
} = require("../queries/expenses");

const {
    deleteSplitsByExpenseId
} = require("../queries/expenseSplits");

async function loginAs(email) {
    const agent = request.agent(app);

    const response = await agent
        .post("/api/auth/login")
        .send({
            email: email,
            password: "password123"
        });

    expect(response.status).toBe(200);

    return agent;
}

describe("Expense API Validation", () => {
    it("should reject an expense when the payer is not a group member", async () => {
        const agent = await loginAs(
            "authtest@example.com"
        );

        const response = await agent
            .post("/api/groups/8/expenses")
            .send({
                paid_by: 54,
                description: "Test Expense",
                amount: "100.00",
                expense_date: "2026-09-06",
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

    it("should reject an expense when a split user is not a group member", async () => {
        const agent = await loginAs(
            "groupowner@example.com"
        );

        const response = await agent
            .post("/api/groups/8/expenses")
            .send({
                paid_by: 55,
                description: "Invalid Split Test",
                amount: "100.00",
                expense_date: "2026-09-06",
                split_type: "equal",
                splits: [
                    {
                        user_id: 55
                    },
                    {
                        user_id: 54
                    }
                ]
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
            "User 54 must be a member of the group"
        );
    });

    it("should reject duplicate users in splits", async () => {
        const agent = await loginAs(
            "groupowner@example.com"
        );

        const response = await agent
            .post("/api/groups/8/expenses")
            .send({
                paid_by: 55,
                description: "Duplicate Split Test",
                amount: "100.00",
                expense_date: "2026-09-06",
                split_type: "equal",
                splits: [
                    {
                        user_id: 55
                    },
                    {
                        user_id: 55
                    }
                ]
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
            "A user cannot appear more than once in the splits"
        );
    });

    it("should reject exact splits when amounts do not add up", async () => {
        const agent = await loginAs(
            "groupowner@example.com"
        );

        const response = await agent
            .post("/api/groups/8/expenses")
            .send({
                paid_by: 55,
                description: "Exact Split Test",
                amount: "100.00",
                expense_date: "2026-09-06",
                split_type: "exact",
                splits: [
                    {
                        user_id: 55,
                        amount: "40.00"
                    }
                ]
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
            "Exact split amounts must add up to the expense amount"
        );
    });

    it("should reject percentage splits when they do not add up to 100%", async () => {
        const agent = await loginAs(
            "groupowner@example.com"
        );

        const response = await agent
            .post("/api/groups/8/expenses")
            .send({
                paid_by: 55,
                description: "Percentage Split Test",
                amount: "100.00",
                expense_date: "2026-09-06",
                split_type: "percentage",
                splits: [
                    {
                        user_id: 55,
                        percentage: "60"
                    }
                ]
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe(
            "Percentage splits must add up to 100%"
        );
    });

    it("should create an equal split expense successfully", async () => {
        const agent = await loginAs(
            "groupowner@example.com"
        );

        const response = await agent
            .post("/api/groups/8/expenses")
            .send({
                paid_by: 55,
                description: "Successful Equal Split",
                amount: "100.00",
                expense_date: "2026-09-06",
                split_type: "equal",
                splits: [
                    {
                        user_id: 55
                    }
                ]
            });

        expect(response.status).toBe(201);
        expect(response.body.amount_paise).toBe(10000);
        expect(response.body.split_type).toBe("equal");

        await deleteSplitsByExpenseId(
            response.body.id
        );

        await deleteExpense(
            response.body.id
        );
    });
});