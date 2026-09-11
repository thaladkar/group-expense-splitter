const {
    getGroupBalances
} = require("../queries/balances");

async function getBalances(req, res) {
    try {
        const groupId = req.params.groupId;

        const balances = await getGroupBalances(groupId);

        return res.status(200).json(balances);
    } catch (error) {
        console.error("Get balances error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

module.exports = {
    getBalances
};