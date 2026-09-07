const {
    createExpense,
    getExpensesByGroupId
} = require("../queries/expenses");

const {
    createExpenseSplit
} = require("../queries/expenseSplits");

async function addExpense(req, res) {
    try {
        const groupId = req.params.groupId;

        const {
            paid_by,
            description,
            amount,
            expense_date,
            split_type,
            splits
        } = req.body;

        // Basic validation
        if (
            !paid_by ||
            !description ||
            !amount ||
            !expense_date ||
            !split_type ||
            !splits
        ) {
            return res.status(400).json({
                error: "All expense fields are required"
            });
        }

        if (!Array.isArray(splits) || splits.length === 0) {
            return res.status(400).json({
                error: "At least one split is required"
            });
        }

        if (!["equal", "exact", "percentage"].includes(split_type)) {
            return res.status(400).json({
                error: "Invalid split type"
            });
        }

        // Convert rupees to paise
        const amountPaise = Math.round(Number(amount) * 100);

        if (amountPaise <= 0) {
            return res.status(400).json({
                error: "Amount must be greater than 0"
            });
        }

        // Create the expense
        const expenseId = await createExpense({
            groupId: groupId,
            paidBy: paid_by,
            description: description,
            amountPaise: amountPaise,
            expenseDate: expense_date,
            splitType: split_type
        });

        // Create the splits
        for (let i = 0; i < splits.length; i++) {
            const split = splits[i];

            let splitValue;
            let shareAmountPaise;

            if (split_type === "equal") {
                splitValue = 1;

                // Base amount for each person
                const baseShare = Math.floor(
                    amountPaise / splits.length
                );

                // Remaining paise after equal division
                const remainder = amountPaise % splits.length;

                // Give one extra paise to the first
                // "remainder" number of users
                shareAmountPaise = baseShare;

                if (i < remainder) {
                    shareAmountPaise += 1;
                }
            }

            if (split_type === "exact") {
                splitValue = Number(split.amount);

                shareAmountPaise = Math.round(
                    Number(split.amount) * 100
                );
            }

            if (split_type === "percentage") {
                splitValue = Number(split.percentage);

                shareAmountPaise = Math.round(
                    amountPaise * splitValue / 100
                );
            }

            await createExpenseSplit(
                expenseId,
                split.user_id,
                splitValue,
                shareAmountPaise
            );
        }

        return res.status(201).json({
            id: expenseId,
            group_id: Number(groupId),
            paid_by: paid_by,
            description: description,
            amount_paise: amountPaise,
            expense_date: expense_date,
            split_type: split_type
        });

    } catch (error) {
        console.error("Add expense error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

async function getExpenses(req, res) {
    try {
        const groupId = req.params.groupId;

        const expenses = await getExpensesByGroupId(groupId);

        return res.status(200).json(expenses);

    } catch (error) {
        console.error("Get expenses error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

module.exports = {
    addExpense,
    getExpenses
};