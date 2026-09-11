const {
    getGroupBalances
} = require("../queries/balances");

const {
    calculateSettlements
} = require("../services/settlementAlgorithm");

const {
    createSettlement
} = require("../queries/settlements");

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

async function getSuggestedSettlements(req, res) {
    try {
        const groupId = req.params.groupId;

        const balances =
            await getGroupBalances(groupId);

        const settlements =
            calculateSettlements(balances);

        return res.status(200).json(settlements);
    } catch (error) {
        console.error(
            "Get suggested settlements error:",
            error
        );

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

async function recordSettlement(req, res) {
    try {
        const groupId = req.params.groupId;

        const {
            paid_by,
            paid_to,
            amount
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
            paid_to === undefined ||
            paid_to === null ||
            amount === undefined ||
            amount === null
        ) {
            return res.status(400).json({
                error: "paid_by, paid_to and amount are required"
            });
        }

        // Validate paid_by
        if (!isValidPositiveInteger(paid_by)) {
            return res.status(400).json({
                error: "paid_by must be a valid user ID"
            });
        }

        // Validate paid_to
        if (!isValidPositiveInteger(paid_to)) {
            return res.status(400).json({
                error: "paid_to must be a valid user ID"
            });
        }

        // A user cannot pay themselves
        if (Number(paid_by) === Number(paid_to)) {
            return res.status(400).json({
                error: "paid_by and paid_to must be different users"
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

        // Check that the payer belongs to the group
        const payerIsMember = await isUserMember(
            Number(paid_by),
            Number(groupId)
        );

        if (!payerIsMember) {
            return res.status(400).json({
                error: "Payer must be a member of the group"
            });
        }

        // Check that the receiver belongs to the group
        const receiverIsMember = await isUserMember(
            Number(paid_to),
            Number(groupId)
        );

        if (!receiverIsMember) {
            return res.status(400).json({
                error: "Receiver must be a member of the group"
            });
        }

        // Create the settlement
        const settlementId = await createSettlement(
            Number(groupId),
            Number(paid_by),
            Number(paid_to),
            amountPaise
        );

        return res.status(201).json({
            id: settlementId,
            group_id: Number(groupId),
            paid_by: Number(paid_by),
            paid_to: Number(paid_to),
            amount_paise: amountPaise
        });
    } catch (error) {
        console.error(
            "Record settlement error:",
            error
        );

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

module.exports = {
    getSuggestedSettlements,
    recordSettlement
};