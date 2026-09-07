const db = require("../config/database");

async function createExpense(expenseData) {
    const [expenseId] = await db("expenses").insert({
        group_id: expenseData.groupId,
        paid_by: expenseData.paidBy,
        description: expenseData.description,
        amount_paise: expenseData.amountPaise,
        expense_date: expenseData.expenseDate,
        split_type: expenseData.splitType
    });

    return expenseId;
}

async function getExpenseById(expenseId) {
    return db("expenses")
        .where({ id: expenseId })
        .first();
}

async function getExpensesByGroupId(groupId) {
    return db("expenses")
        .where({ group_id: groupId })
        .orderBy("expense_date", "desc");
}

async function updateExpense(expenseId, expenseData) {
    return db("expenses")
        .where({ id: expenseId })
        .update({
            group_id: expenseData.groupId,
            paid_by: expenseData.paidBy,
            description: expenseData.description,
            amount_paise: expenseData.amountPaise,
            expense_date: expenseData.expenseDate,
            split_type: expenseData.splitType
        });
}

async function deleteExpense(expenseId) {
    return db("expenses")
        .where({ id: expenseId })
        .del();
}

module.exports = {
    createExpense,
    getExpenseById,
    getExpensesByGroupId,
    updateExpense,
    deleteExpense
};