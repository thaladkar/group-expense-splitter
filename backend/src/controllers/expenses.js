const {
    createExpense,
    getExpenseById,
    getExpensesByGroupId,
    updateExpense: updateExpenseQuery,
    deleteExpense: deleteExpenseQuery
} = require("../queries/expenses");

const {
    createExpenseSplit,
    deleteSplitsByExpenseId
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

async function validateExpenseRequest(
    groupId,
    body
) {
    const {
        paid_by,
        description,
        amount,
        expense_date,
        split_type,
        splits
    } = body;

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
        return {
            error: "All expense fields are required"
        };
    }

    if (!isValidPositiveInteger(paid_by)) {
        return {
            error: "paid_by must be a valid user ID"
        };
    }

    if (
        typeof description !== "string" ||
        description.trim() === ""
    ) {
        return {
            error: "Description is required"
        };
    }

    if (!isValidMoney(amount)) {
        return {
            error: "Amount must be a positive number with at most 2 decimal places"
        };
    }

    const amountPaise = moneyToPaise(amount);

    if (amountPaise <= 0) {
        return {
            error: "Amount must be greater than 0"
        };
    }

    if (!isValidDate(expense_date)) {
        return {
            error: "Expense date must be a valid date in YYYY-MM-DD format"
        };
    }

    if (
        !["equal", "exact", "percentage"].includes(
            split_type
        )
    ) {
        return {
            error: "Invalid split type"
        };
    }

    if (
        !Array.isArray(splits) ||
        splits.length === 0
    ) {
        return {
            error: "At least one split is required"
        };
    }

    const payerIsMember = await isUserMember(
        Number(paid_by),
        Number(groupId)
    );

    if (!payerIsMember) {
        return {
            error: "Payer must be a member of the group"
        };
    }

    for (const split of splits) {
        if (
            !split ||
            !isValidPositiveInteger(split.user_id)
        ) {
            return {
                error: "Every split must have a valid user_id"
            };
        }
    }

    const userIds = splits.map(
        (split) => Number(split.user_id)
    );

    const uniqueUserIds = new Set(userIds);

    if (uniqueUserIds.size !== userIds.length) {
        return {
            error: "A user cannot appear more than once in the splits"
        };
    }

    for (const userId of uniqueUserIds) {
        const member = await isUserMember(
            userId,
            Number(groupId)
        );

        if (!member) {
            return {
                error: `User ${userId} must be a member of the group`
            };
        }
    }

    if (split_type === "exact") {
        let totalSplitPaise = 0;

        for (const split of splits) {
            if (!isValidMoney(split.amount)) {
                return {
                    error: "Each exact split must have a positive amount with at most 2 decimal places"
                };
            }

            totalSplitPaise += moneyToPaise(
                split.amount
            );
        }

        if (totalSplitPaise !== amountPaise) {
            return {
                error: "Exact split amounts must add up to the expense amount"
            };
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
                return {
                    error: "Each percentage split must have a valid percentage"
                };
            }

            const percentage = Number(
                split.percentage
            );

            if (
                percentage <= 0 ||
                percentage > 100
            ) {
                return {
                    error: "Each percentage must be greater than 0 and at most 100"
                };
            }

            const basisPoints = Math.round(
                percentage * 100
            );

            totalBasisPoints += basisPoints;
        }

        if (totalBasisPoints !== 10000) {
            return {
                error: "Percentage splits must add up to 100%"
            };
        }
    }

    return {
        value: {
            paidBy: Number(paid_by),
            description: description.trim(),
            amountPaise,
            expenseDate: expense_date,
            splitType: split_type,
            splits
        }
    };
}

function calculateSplitRows(
    amountPaise,
    splitType,
    splits
) {
    if (splitType === "equal") {
        const baseShare = Math.floor(
            amountPaise / splits.length
        );

        const remainder =
            amountPaise % splits.length;

        return splits.map((split, index) => ({
            userId: Number(split.user_id),
            splitValue: 1,
            shareAmountPaise:
                baseShare +
                (index < remainder ? 1 : 0)
        }));
    }

    if (splitType === "exact") {
        return splits.map((split) => {
            const shareAmountPaise =
                moneyToPaise(split.amount);

            return {
                userId: Number(split.user_id),
                splitValue: shareAmountPaise,
                shareAmountPaise
            };
        });
    }

    const calculatedSplits = [];
    let totalCalculatedPaise = 0;

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
            splitValue: basisPoints,
            shareAmountPaise: basePaise,
            remainder
        });

        totalCalculatedPaise += basePaise;
    }

    let remainingPaise =
        amountPaise - totalCalculatedPaise;

    calculatedSplits.sort((a, b) => {
        if (b.remainder !== a.remainder) {
            return b.remainder - a.remainder;
        }

        return a.userId - b.userId;
    });

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

    return calculatedSplits;
}

async function createSplitRows(
    expenseId,
    splitRows
) {
    for (const split of splitRows) {
        await createExpenseSplit(
            expenseId,
            split.userId,
            split.splitValue,
            split.shareAmountPaise
        );
    }
}

async function addExpense(req, res) {
    try {
        const groupId = req.params.groupId;

        if (!isValidPositiveInteger(groupId)) {
            return res.status(400).json({
                error: "Invalid group ID"
            });
        }

        const validation =
            await validateExpenseRequest(
                Number(groupId),
                req.body
            );

        if (validation.error) {
            return res.status(400).json({
                error: validation.error
            });
        }

        const expenseData = validation.value;

        const expenseId = await createExpense({
            groupId: Number(groupId),
            paidBy: expenseData.paidBy,
            description: expenseData.description,
            amountPaise: expenseData.amountPaise,
            expenseDate: expenseData.expenseDate,
            splitType: expenseData.splitType
        });

        const splitRows = calculateSplitRows(
            expenseData.amountPaise,
            expenseData.splitType,
            expenseData.splits
        );

        await createSplitRows(
            expenseId,
            splitRows
        );

        return res.status(201).json({
            id: expenseId,
            group_id: Number(groupId),
            paid_by: expenseData.paidBy,
            description: expenseData.description,
            amount_paise: expenseData.amountPaise,
            expense_date: expenseData.expenseDate,
            split_type: expenseData.splitType
        });
    } catch (error) {
        console.error(
            "Add expense error:",
            error
        );

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
        console.error(
            "Get expenses error:",
            error
        );

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

async function editExpense(req, res) {
    try {
        const groupId = req.params.groupId;
        const expenseId = req.params.expenseId;

        if (!isValidPositiveInteger(groupId)) {
            return res.status(400).json({
                error: "Invalid group ID"
            });
        }

        if (!isValidPositiveInteger(expenseId)) {
            return res.status(400).json({
                error: "Invalid expense ID"
            });
        }

        const existingExpense =
            await getExpenseById(
                Number(expenseId)
            );

        if (
            !existingExpense ||
            Number(existingExpense.group_id) !==
                Number(groupId)
        ) {
            return res.status(404).json({
                error: "Expense not found"
            });
        }

        const validation =
            await validateExpenseRequest(
                Number(groupId),
                req.body
            );

        if (validation.error) {
            return res.status(400).json({
                error: validation.error
            });
        }

        const expenseData = validation.value;

        const splitRows = calculateSplitRows(
            expenseData.amountPaise,
            expenseData.splitType,
            expenseData.splits
        );

        await updateExpenseQuery(
            Number(expenseId),
            {
                groupId: Number(groupId),
                paidBy: expenseData.paidBy,
                description:
                    expenseData.description,
                amountPaise:
                    expenseData.amountPaise,
                expenseDate:
                    expenseData.expenseDate,
                splitType:
                    expenseData.splitType
            }
        );

        await deleteSplitsByExpenseId(
            Number(expenseId)
        );

        await createSplitRows(
            Number(expenseId),
            splitRows
        );

        return res.status(200).json({
            id: Number(expenseId),
            group_id: Number(groupId),
            paid_by: expenseData.paidBy,
            description:
                expenseData.description,
            amount_paise:
                expenseData.amountPaise,
            expense_date:
                expenseData.expenseDate,
            split_type:
                expenseData.splitType
        });
    } catch (error) {
        console.error(
            "Edit expense error:",
            error
        );

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

async function removeExpense(req, res) {
    try {
        const groupId = req.params.groupId;
        const expenseId = req.params.expenseId;

        if (!isValidPositiveInteger(groupId)) {
            return res.status(400).json({
                error: "Invalid group ID"
            });
        }

        if (!isValidPositiveInteger(expenseId)) {
            return res.status(400).json({
                error: "Invalid expense ID"
            });
        }

        const existingExpense =
            await getExpenseById(
                Number(expenseId)
            );

        if (
            !existingExpense ||
            Number(existingExpense.group_id) !==
                Number(groupId)
        ) {
            return res.status(404).json({
                error: "Expense not found"
            });
        }

        await deleteSplitsByExpenseId(
            Number(expenseId)
        );

        await deleteExpenseQuery(
            Number(expenseId)
        );

        return res.status(200).json({
            message: "Expense deleted successfully"
        });
    } catch (error) {
        console.error(
            "Delete expense error:",
            error
        );

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

module.exports = {
    addExpense,
    getExpenses,
    editExpense,
    removeExpense
};