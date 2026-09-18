const db = require("../config/database");

async function createExpenseSplit(expenseId, userId, splitValue, shareAmountPaise) {
    const [splitId] = await db("expense_splits").insert({
        expense_id: expenseId,
        user_id: userId,
        split_value: splitValue,
        share_amount_paise: shareAmountPaise
    });

    return splitId;
}

async function getSplitsByExpenseId(expenseId) {
    return db("expense_splits")
        .where({ expense_id: expenseId });
}

async function deleteSplitsByExpenseId(expenseId) {
    return db("expense_splits")
        .where({ expense_id: expenseId })
        .del();
}

module.exports = {
    createExpenseSplit,
    getSplitsByExpenseId,
    deleteSplitsByExpenseId
};