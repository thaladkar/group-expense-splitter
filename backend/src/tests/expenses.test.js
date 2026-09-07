import { describe, it, expect } from "vitest";

const {
    createExpense,
    getExpenseById,
    getExpensesByGroupId,
    updateExpense,
    deleteExpense
} = require("../queries/expenses");

describe("Expense Queries", () => {
    it("should create an expense", async () => {
        const expenseId = await createExpense({
            groupId: 1,
            paidBy: 1,
            description: "Create Test Expense",
            amountPaise: 10000,
            expenseDate: "2026-09-06",
            splitType: "equal"
        });

        expect(expenseId).toBeGreaterThan(0);

        await deleteExpense(expenseId);
    });

    it("should get an expense by ID", async () => {
        const expenseId = await createExpense({
            groupId: 1,
            paidBy: 1,
            description: "Get Test Expense",
            amountPaise: 10000,
            expenseDate: "2026-09-06",
            splitType: "equal"
        });

        const expense = await getExpenseById(expenseId);

        expect(expense).toBeDefined();
        expect(expense.id).toBe(expenseId);

        await deleteExpense(expenseId);
    });

    it("should get expenses by group ID", async () => {
        const expenseId = await createExpense({
            groupId: 1,
            paidBy: 1,
            description: "Group Expense Test",
            amountPaise: 10000,
            expenseDate: "2026-09-06",
            splitType: "equal"
        });

        const expenses = await getExpensesByGroupId(1);

        expect(Array.isArray(expenses)).toBe(true);
        expect(expenses.length).toBeGreaterThan(0);

        await deleteExpense(expenseId);
    });

    it("should update an expense", async () => {
        const expenseId = await createExpense({
            groupId: 1,
            paidBy: 1,
            description: "Update Test Expense",
            amountPaise: 10000,
            expenseDate: "2026-09-06",
            splitType: "equal"
        });

        const updatedRows = await updateExpense(expenseId, {
            groupId: 1,
            paidBy: 1,
            description: "Updated Expense",
            amountPaise: 15000,
            expenseDate: "2026-09-06",
            splitType: "equal"
        });

        expect(updatedRows).toBeGreaterThan(0);

        await deleteExpense(expenseId);
    });

    it("should delete an expense", async () => {
        const expenseId = await createExpense({
            groupId: 1,
            paidBy: 1,
            description: "Delete Test Expense",
            amountPaise: 10000,
            expenseDate: "2026-09-06",
            splitType: "equal"
        });

        const deletedRows = await deleteExpense(expenseId);

        expect(deletedRows).toBeGreaterThan(0);
    });
});