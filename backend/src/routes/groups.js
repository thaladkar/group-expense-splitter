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
    requireAuthentication,
    checkGroupMembership
} = require("../controllers/authorization");

const router = express.Router();

// Create a new group
router.post(
    "/",
    requireAuthentication,
    createNewGroup
);

// Get groups of logged-in user
router.get(
    "/",
    requireAuthentication,
    getMyGroups
);

// Get one group
router.get(
    "/:groupId",
    requireAuthentication,
    checkGroupMembership,
    getGroup
);

// Add a member
router.post(
    "/:groupId/members",
    requireAuthentication,
    checkGroupMembership,
    addGroupMember
);

// Get group members
router.get(
    "/:groupId/members",
    requireAuthentication,
    checkGroupMembership,
    getMembers
);

// Remove a member
router.delete(
    "/:groupId/members/:userId",
    requireAuthentication,
    checkGroupMembership,
    removeGroupMember
);

// Add an expense
router.post(
    "/:groupId/expenses",
    requireAuthentication,
    checkGroupMembership,
    addExpense
);

// Get group expenses
router.get(
    "/:groupId/expenses",
    requireAuthentication,
    checkGroupMembership,
    getExpenses
);

module.exports = router;