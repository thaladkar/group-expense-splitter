const {
    createExpense,
    getExpensesByGroupId
} = require("../queries/expenses");

const {
    createExpenseSplit
} = require("../queries/expenseSplits");

const {
    isUserMember
} = require("../queries/memberships");

function isValidPositiveInteger(value) {
    return (
        Number.isInteger(Number(value)) &&
        Number(value) > 0
    );
}

function isValidMoney(value) {
    if (value === null || value === undefined) {
        return false;
    }

    const valueString = String(value).trim();

    if (!/^\d+(\.\d{1,2})?$/.test(valueString)) {
        return false;
    }

    return Number(valueString) > 0;
}

function moneyToPaise(value) {
    return Math.round(Number(value) * 100);
}

function isValidDate(value) {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const [year, month, day] = value
        .split("-")
        .map(Number);

    const date = new Date(
        Date.UTC(year, month - 1, day)
    );

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

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

        // Validate group ID
        if (!isValidPositiveInteger(groupId)) {
            return res.status(400).json({
                error: "Invalid group ID"
            });
        }

        // Validate required fields
        if (
            paid_by === undefined ||
            paid_by === null ||
            !description ||
            !amount ||
            !expense_date ||
            !split_type ||
            splits === undefined ||
            splits === null
        ) {
            return res.status(400).json({
                error: "All expense fields are required"
            });
        }

        // Validate paid_by
        if (!isValidPositiveInteger(paid_by)) {
            return res.status(400).json({
                error: "paid_by must be a valid user ID"
            });
        }

        // Validate description
        if (
            typeof description !== "string" ||
            description.trim() === ""
        ) {
            return res.status(400).json({
                error: "Description is required"
            });
        }

        // Validate amount
        if (!isValidMoney(amount)) {
            return res.status(400).json({
                error: "Amount must be a positive number with at most 2 decimal places"
            });
        }

        const amountPaise = moneyToPaise(amount);

        if (amountPaise <= 0) {
            return res.status(400).json({
                error: "Amount must be greater than 0"
            });
        }

        // Validate date
        if (!isValidDate(expense_date)) {
            return res.status(400).json({
                error: "Expense date must be a valid date in YYYY-MM-DD format"
            });
        }

        // Validate split type
        if (
            !["equal", "exact", "percentage"].includes(
                split_type
            )
        ) {
            return res.status(400).json({
                error: "Invalid split type"
            });
        }

        // Validate splits array
        if (!Array.isArray(splits) || splits.length === 0) {
            return res.status(400).json({
                error: "At least one split is required"
            });
        }

        // Check that payer belongs to the group
        const payerIsMember = await isUserMember(
            Number(paid_by),
            Number(groupId)
        );

        if (!payerIsMember) {
            return res.status(400).json({
                error: "Payer must be a member of the group"
            });
        }

        // Check every split has a valid user ID
        for (const split of splits) {
            if (
                !split ||
                !isValidPositiveInteger(split.user_id)
            ) {
                return res.status(400).json({
                    error: "Every split must have a valid user_id"
                });
            }
        }

        // Check for duplicate users
        const userIds = splits.map(
            (split) => Number(split.user_id)
        );

        const uniqueUserIds = new Set(userIds);

        if (uniqueUserIds.size !== userIds.length) {
            return res.status(400).json({
                error: "A user cannot appear more than once in the splits"
            });
        }

        // Check that every split user belongs to the group
        for (const userId of uniqueUserIds) {
            const member = await isUserMember(
                userId,
                Number(groupId)
            );

            if (!member) {
                return res.status(400).json({
                    error: `User ${userId} must be a member of the group`
                });
            }
        }

        /*
         * Validate split values before creating the expense.
         * This prevents an invalid request from leaving
         * an incomplete expense in the database.
         */

        if (split_type === "exact") {
            let totalSplitPaise = 0;

            for (const split of splits) {
                if (!isValidMoney(split.amount)) {
                    return res.status(400).json({
                        error: "Each exact split must have a positive amount with at most 2 decimal places"
                    });
                }

                const splitPaise = moneyToPaise(
                    split.amount
                );

                totalSplitPaise += splitPaise;
            }

            if (totalSplitPaise !== amountPaise) {
                return res.status(400).json({
                    error: "Exact split amounts must add up to the expense amount"
                });
            }
        }

        if (split_type === "percentage") {
            let totalBasisPoints = 0;

            for (const split of splits) {
                if (
                    split.percentage === undefined ||
                    split.percentage === null ||
                    !/^\d+(\.\d{1,2})?$/.test(
                        String(split.percentage).trim()
                    )
                ) {
                    return res.status(400).json({
                        error: "Each percentage split must have a valid percentage"
                    });
                }

                const percentage = Number(
                    split.percentage
                );

                if (percentage <= 0 || percentage > 100) {
                    return res.status(400).json({
                        error: "Each percentage must be greater than 0 and at most 100"
                    });
                }

                // Store percentage as basis points.
                // Example: 33.33% becomes 3333.
                const basisPoints = Math.round(
                    percentage * 100
                );

                totalBasisPoints += basisPoints;
            }

            if (totalBasisPoints !== 10000) {
                return res.status(400).json({
                    error: "Percentage splits must add up to 100%"
                });
            }
        }

        // Create the expense only after all validation passes.
        const expenseId = await createExpense({
            groupId: Number(groupId),
            paidBy: Number(paid_by),
            description: description.trim(),
            amountPaise: amountPaise,
            expenseDate: expense_date,
            splitType: split_type
        });

        // Create the splits
        if (split_type === "equal") {
            const baseShare = Math.floor(
                amountPaise / splits.length
            );

            const remainder =
                amountPaise % splits.length;

            for (let i = 0; i < splits.length; i++) {
                let shareAmountPaise = baseShare;

                if (i < remainder) {
                    shareAmountPaise += 1;
                }

                await createExpenseSplit(
                    expenseId,
                    Number(splits[i].user_id),
                    1,
                    shareAmountPaise
                );
            }
        }

        if (split_type === "exact") {
            for (const split of splits) {
                const shareAmountPaise =
                    moneyToPaise(split.amount);

                await createExpenseSplit(
                    expenseId,
                    Number(split.user_id),
                    shareAmountPaise,
                    shareAmountPaise
                );
            }
        }

        if (split_type === "percentage") {
            const calculatedSplits = [];

            let totalCalculatedPaise = 0;

            // Calculate the initial floor amounts
            for (const split of splits) {
                const basisPoints = Math.round(
                    Number(split.percentage) * 100
                );

                const exactPaise =
                    amountPaise * basisPoints / 10000;

                const basePaise = Math.floor(
                    exactPaise
                );

                const remainder =
                    exactPaise - basePaise;

                calculatedSplits.push({
                    userId: Number(split.user_id),
                    basisPoints: basisPoints,
                    shareAmountPaise: basePaise,
                    remainder: remainder
                });

                totalCalculatedPaise += basePaise;
            }

            // Distribute any remaining paise deterministically.
            let remainingPaise =
                amountPaise - totalCalculatedPaise;

            calculatedSplits.sort(
                (a, b) => b.remainder - a.remainder
            );

            let index = 0;

            while (remainingPaise > 0) {
                calculatedSplits[index]
                    .shareAmountPaise += 1;

                remainingPaise -= 1;
                index += 1;

                if (index >= calculatedSplits.length) {
                    index = 0;
                }
            }

            for (const split of calculatedSplits) {
                await createExpenseSplit(
                    expenseId,
                    split.userId,
                    split.basisPoints,
                    split.shareAmountPaise
                );
            }
        }

        return res.status(201).json({
            id: expenseId,
            group_id: Number(groupId),
            paid_by: Number(paid_by),
            description: description.trim(),
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

        const expenses =
            await getExpensesByGroupId(groupId);

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