const db = require("../config/database");

async function getGroupBalances(groupId) {
    const members = await db("users")
        .join(
            "memberships",
            "users.id",
            "memberships.user_id"
        )
        .where("memberships.group_id", groupId)
        .select(
            "users.id",
            "users.name",
            "users.email"
        );

    const balances = [];

    for (const member of members) {
        const paidExpenses = await db("expenses")
            .where({
                group_id: groupId,
                paid_by: member.id
            })
            .sum("amount_paise as total");

        const owedExpenses = await db("expense_splits")
            .join(
                "expenses",
                "expense_splits.expense_id",
                "expenses.id"
            )
            .where({
                "expenses.group_id": groupId,
                "expense_splits.user_id": member.id
            })
            .sum(
                "expense_splits.share_amount_paise as total"
            );

        const settlementsPaid = await db("settlements")
            .where({
                group_id: groupId,
                paid_by: member.id
            })
            .sum("amount_paise as total");

        const settlementsReceived = await db("settlements")
            .where({
                group_id: groupId,
                paid_to: member.id
            })
            .sum("amount_paise as total");

        const paidAmount = Number(
            paidExpenses[0].total || 0
        );

        const owedAmount = Number(
            owedExpenses[0].total || 0
        );

        const paidSettlementAmount = Number(
            settlementsPaid[0].total || 0
        );

        const receivedSettlementAmount = Number(
            settlementsReceived[0].total || 0
        );

        const balance =
            paidAmount
            - owedAmount
            - paidSettlementAmount
            + receivedSettlementAmount;

        balances.push({
            user_id: member.id,
            name: member.name,
            email: member.email,
            balance_paise: balance
        });
    }

    return balances;
}

module.exports = {
    getGroupBalances
};