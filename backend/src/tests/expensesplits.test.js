import { describe, it, expect } from "vitest";

const {
    createExpenseSplit,
    getSplitsByExpenseId,
    deleteSplitsByExpenseId
} = require("../queries/expenseSplits");

const {
    createExpense,
    deleteExpense
} = require("../queries/expenses");

describe("Expense Split Queries", () => {
    it("should create an expense split", async () => {
        const expenseId = await createExpense({
            groupId: 1,
            paidBy: 1,
            description: "Split Create Test",
            amountPaise: 10000,
            expenseDate: "2026-09-06",
            splitType: "equal"
        });

        const splitId = await createExpenseSplit(
            expenseId,
            1,
            1,
            10000
        );

        expect(splitId).toBeGreaterThan(0);

        await deleteSplitsByExpenseId(expenseId);
        await deleteExpense(expenseId);
    });

    it("should get splits by expense ID", async () => {
        const expenseId = await createExpense({
            groupId: 1,
            paidBy: 1,
            description: "Split Get Test",
            amountPaise: 10000,
            expenseDate: "2026-09-06",
            splitType: "equal"
        });

        await createExpenseSplit(
            expenseId,
            1,
            1,
            10000
        );

        const splits = await getSplitsByExpenseId(expenseId);

        expect(Array.isArray(splits)).toBe(true);
        expect(splits.length).toBe(1);
        expect(splits[0].expense_id).toBe(expenseId);

        await deleteSplitsByExpenseId(expenseId);
        await deleteExpense(expenseId);
    });

    it("should delete splits by expense ID", async () => {
        const expenseId = await createExpense({
            groupId: 1,
            paidBy: 1,
            description: "Split Delete Test",
            amountPaise: 10000,
            expenseDate: "2026-09-06",
            splitType: "equal"
        });

        await createExpenseSplit(
            expenseId,
            1,
            1,
            10000
        );

        const deletedRows = await deleteSplitsByExpenseId(expenseId);

        expect(deletedRows).toBe(1);

        await deleteExpense(expenseId);
    });
});