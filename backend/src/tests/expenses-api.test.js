import { describe, it, expect } from "vitest";

const {
    createExpense,
    deleteExpense
} = require("../queries/expenses");

const {
    deleteSplitsByExpenseId
} = require("../queries/expenseSplits");


describe("Expense API Validation", () => {

    it("should reject an expense when the payer is not a group member", async () => {
        // User 54 is not a member of Group 8
        const response = await fetch(
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

        expect(response.status).toBe(200);

        const setCookie =
            response.headers.get("set-cookie");

        const sessionCookie =
            setCookie.split(";")[0];

        const expenseResponse = await fetch(
            "http://localhost:3000/api/groups/8/expenses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: sessionCookie
                },
                body: JSON.stringify({
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
                })
            }
        );

        const data = await expenseResponse.json();

        expect(expenseResponse.status).toBe(403);
        expect(data.error).toBe(
            "You are not a member of this group"
        );
    });


    it("should reject an expense when a split user is not a group member", async () => {
        // User 55 is a member of Group 8
        const response = await fetch(
            "http://localhost:3000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: "groupowner@example.com",
                    password: "password123"
                })
            }
        );

        expect(response.status).toBe(200);

        const setCookie =
            response.headers.get("set-cookie");

        const sessionCookie =
            setCookie.split(";")[0];

        // User 54 is NOT a member of Group 8
        const expenseResponse = await fetch(
            "http://localhost:3000/api/groups/8/expenses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: sessionCookie
                },
                body: JSON.stringify({
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
                })
            }
        );

        const data = await expenseResponse.json();

        expect(expenseResponse.status).toBe(400);
        expect(data.error).toBe(
            "User 54 must be a member of the group"
        );
    });


    it("should reject duplicate users in splits", async () => {
        const response = await fetch(
            "http://localhost:3000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: "groupowner@example.com",
                    password: "password123"
                })
            }
        );

        expect(response.status).toBe(200);

        const setCookie =
            response.headers.get("set-cookie");

        const sessionCookie =
            setCookie.split(";")[0];

        const expenseResponse = await fetch(
            "http://localhost:3000/api/groups/8/expenses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: sessionCookie
                },
                body: JSON.stringify({
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
                })
            }
        );

        const data = await expenseResponse.json();

        expect(expenseResponse.status).toBe(400);
        expect(data.error).toBe(
            "A user cannot appear more than once in the splits"
        );
    });


    it("should reject exact splits when amounts do not add up", async () => {
        const response = await fetch(
            "http://localhost:3000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: "groupowner@example.com",
                    password: "password123"
                })
            }
        );

        expect(response.status).toBe(200);

        const setCookie =
            response.headers.get("set-cookie");

        const sessionCookie =
            setCookie.split(";")[0];

        const expenseResponse = await fetch(
            "http://localhost:3000/api/groups/8/expenses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: sessionCookie
                },
                body: JSON.stringify({
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
                })
            }
        );

        const data = await expenseResponse.json();

        expect(expenseResponse.status).toBe(400);
        expect(data.error).toBe(
            "Exact split amounts must add up to the expense amount"
        );
    });


    it("should reject percentage splits when they do not add up to 100%", async () => {
        const response = await fetch(
            "http://localhost:3000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: "groupowner@example.com",
                    password: "password123"
                })
            }
        );

        expect(response.status).toBe(200);

        const setCookie =
            response.headers.get("set-cookie");

        const sessionCookie =
            setCookie.split(";")[0];

        const expenseResponse = await fetch(
            "http://localhost:3000/api/groups/8/expenses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: sessionCookie
                },
                body: JSON.stringify({
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
                })
            }
        );

        const data = await expenseResponse.json();

        expect(expenseResponse.status).toBe(400);
        expect(data.error).toBe(
            "Percentage splits must add up to 100%"
        );
    });


    it("should create an equal split expense successfully", async () => {
        const response = await fetch(
            "http://localhost:3000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: "groupowner@example.com",
                    password: "password123"
                })
            }
        );

        expect(response.status).toBe(200);

        const setCookie =
            response.headers.get("set-cookie");

        const sessionCookie =
            setCookie.split(";")[0];

        const expenseResponse = await fetch(
            "http://localhost:3000/api/groups/8/expenses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: sessionCookie
                },
                body: JSON.stringify({
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
                })
            }
        );

        const data = await expenseResponse.json();

        expect(expenseResponse.status).toBe(201);
        expect(data.amount_paise).toBe(10000);
        expect(data.split_type).toBe("equal");

        // Clean up the test expense
        await deleteSplitsByExpenseId(data.id);
        await deleteExpense(data.id);
    });
});

