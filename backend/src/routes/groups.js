const express = require("express");

const {
    createNewGroup,
    getMyGroups,
    getGroup
} = require("../controllers/groups");

const {
    addGroupMember,
    removeGroupMember,
    getMembers
} = require("../controllers/memberships");

const {
    addExpense,
    getExpenses
} = require("../controllers/expenses");

const {
    getBalances
} = require("../controllers/balances");

const {
    getSuggestedSettlements,
    recordSettlement
} = require("../controllers/settlements");

const {
    requireAuthentication,
    checkGroupMembership
} = require("../controllers/authorization");

const router = express.Router();

router.post(
    "/",
    requireAuthentication,
    createNewGroup
);

router.get(
    "/",
    requireAuthentication,
    getMyGroups
);

router.get(
    "/:groupId",
    requireAuthentication,
    checkGroupMembership,
    getGroup
);

router.post(
    "/:groupId/members",
    requireAuthentication,
    checkGroupMembership,
    addGroupMember
);

router.get(
    "/:groupId/members",
    requireAuthentication,
    checkGroupMembership,
    getMembers
);

router.delete(
    "/:groupId/members/:userId",
    requireAuthentication,
    checkGroupMembership,
    removeGroupMember
);

router.post(
    "/:groupId/expenses",
    requireAuthentication,
    checkGroupMembership,
    addExpense
);

router.get(
    "/:groupId/expenses",
    requireAuthentication,
    checkGroupMembership,
    getExpenses
);

router.get(
    "/:groupId/balances",
    requireAuthentication,
    checkGroupMembership,
    getBalances
);

router.get(
    "/:groupId/settlements",
    requireAuthentication,
    checkGroupMembership,
    getSuggestedSettlements
);

router.post(
    "/:groupId/settlements",
    requireAuthentication,
    checkGroupMembership,
    recordSettlement
);

module.exports = router;