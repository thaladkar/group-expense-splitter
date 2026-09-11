function calculateSettlements(balances) {
    const creditors = [];
    const debtors = [];

    for (const balance of balances) {
        if (balance.balance_paise > 0) {
            creditors.push({
                user_id: balance.user_id,
                name: balance.name,
                amount_paise: balance.balance_paise
            });
        }

        if (balance.balance_paise < 0) {
            debtors.push({
                user_id: balance.user_id,
                name: balance.name,
                amount_paise: Math.abs(
                    balance.balance_paise
                )
            });
        }
    }

    const settlements = [];

    let creditorIndex = 0;
    let debtorIndex = 0;

    while (
        creditorIndex < creditors.length &&
        debtorIndex < debtors.length
    ) {
        const creditor = creditors[creditorIndex];
        const debtor = debtors[debtorIndex];

        const settlementAmount = Math.min(
            creditor.amount_paise,
            debtor.amount_paise
        );

        settlements.push({
            paid_by: debtor.user_id,
            paid_to: creditor.user_id,
            amount_paise: settlementAmount
        });

        creditor.amount_paise -= settlementAmount;
        debtor.amount_paise -= settlementAmount;

        if (creditor.amount_paise === 0) {
            creditorIndex++;
        }

        if (debtor.amount_paise === 0) {
            debtorIndex++;
        }
    }

    return settlements;
}

module.exports = {
    calculateSettlements
};