const db = require("../config/database");

async function createSettlement(groupId, paidBy, paidTo, amountPaise) {
    const [settlementId] = await db("settlements").insert({
        group_id: groupId,
        paid_by: paidBy,
        paid_to: paidTo,
        amount_paise: amountPaise
    });

    return settlementId;
}

async function getSettlementsByGroupId(groupId) {
    return db("settlements")
        .where({ group_id: groupId })
        .orderBy("paid_at", "desc");
}

async function getSettlementById(settlementId) {
    return db("settlements")
        .where({ id: settlementId })
        .first();
}

module.exports = {
    createSettlement,
    getSettlementsByGroupId,
    getSettlementById
};