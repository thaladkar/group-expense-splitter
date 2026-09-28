import {
    describe,
    it,
    expect,
    beforeEach,
    afterEach
} from "vitest";

import request from "supertest";

const app = require("../server");
const db = require("../config/database");

const {
    createGroup
} = require("../queries/groups");

const {
    addMember
} = require("../queries/memberships");

const {
    getExpenseById
} = require("../queries/expenses");

const {
    getSplitsByExpenseId
} = require("../queries/expenseSplits");

const {
    getGroupBalances
} = require("../queries/balances");

let groupId;
let groupNumber = 0;

async function loginAsGroupOwner() {
    const agent = request.agent(app);

    const response = await agent
        .post("/api/auth/login")
        .send({
            email: "groupowner@example.com",
            password: "password123"
        });

    expect(response.status).toBe(200);

    return agent;
}

async function loginAsNonMember() {
    const agent = request.agent(app);

    const response = await agent
        .post("/api/auth/login")
        .send({
            email: "authtest@example.com",
            password: "password123"
        });

    expect(response.status).toBe(200);

    return agent;
}

async function cleanupGroup(id) {
    if (!id) {
        return;
    }

    const expenseIds = await db("expenses")
        .where({ group_id: id })
        .pluck("id");

    if (expenseIds.length > 0) {
        await db("expense_splits")
            .whereIn("expense_id", expenseIds)
            .del();
    }

    await db("settlements")
        .where({ group_id: id })
        .del();

    await db("expenses")
        .where({ group_id: id })
        .del();

    await db("memberships")
        .where({ group_id: id })
        .del();

    await db("groups")
        .where({ id: id })
        .del();
}

beforeEach(async () => {
    groupNumber += 1;

    groupId = await createGroup(
        `Phase 3 Test Group ${groupNumber}`,
        55
    );

    await addMember(55, groupId);
    await addMember(1, groupId);
    await addMember(2, groupId);
});

afterEach(async () => {
    await cleanupGroup(groupId);
    groupId = null;
});

describe("Phase 3 Splitting Engine", () => {
    it("should distribute an awkward equal split deterministically", async () => {
        const agent = await loginAsGroupOwner();

        const response = await agent
            .post(`/api/groups/${groupId}/expenses`)
            .send({
                paid_by: 55,
                description: "Awkward Equal Split",
                amount: "100.01",
                expense_date: "2026-09-28",
                split_type: "equal",
                splits: [
                    {
                        user_id: 55
                    },
                    {
                        user_id: 1
                    },
                    {
                        user_id: 2
                    }
                ]
            });

        expect(response.status).toBe(201);
        expect(response.body.amount_paise).toBe(10001);

        const splits =
            await getSplitsByExpenseId(
                response.body.id
            );

        expect(splits).toHaveLength(3);

        const shares = new Map(
            splits.map((split) => [
                Number(split.user_id),
                Number(split.share_amount_paise)
            ])
        );

        expect(shares.get(55)).toBe(3334);
        expect(shares.get(1)).toBe(3334);
        expect(shares.get(2)).toBe(3333);

        const total = splits.reduce(
            (sum, split) =>
                sum +
                Number(
                    split.share_amount_paise
                ),
            0
        );

        expect(total).toBe(10001);
    });

    it("should distribute percentage rounding deterministically", async () => {
        const agent = await loginAsGroupOwner();

        const response = await agent
            .post(`/api/groups/${groupId}/expenses`)
            .send({
                paid_by: 55,
                description:
                    "Percentage Rounding Test",
                amount: "0.01",
                expense_date: "2026-09-28",
                split_type: "percentage",
                splits: [
                    {
                        user_id: 55,
                        percentage: "50"
                    },
                    {
                        user_id: 1,
                        percentage: "50"
                    }
                ]
            });

        expect(response.status).toBe(201);

        const splits =
            await getSplitsByExpenseId(
                response.body.id
            );

        expect(splits).toHaveLength(2);

        const shares = new Map(
            splits.map((split) => [
                Number(split.user_id),
                Number(split.share_amount_paise)
            ])
        );

        expect(shares.get(1)).toBe(1);
        expect(shares.get(55)).toBe(0);

        const total = splits.reduce(
            (sum, split) =>
                sum +
                Number(
                    split.share_amount_paise
                ),
            0
        );

        expect(total).toBe(1);
    });

    it("should edit an expense and replace its old splits", async () => {
        const agent = await loginAsGroupOwner();

        const createResponse = await agent
            .post(`/api/groups/${groupId}/expenses`)
            .send({
                paid_by: 55,
                description: "Original Expense",
                amount: "90.00",
                expense_date: "2026-09-28",
                split_type: "equal",
                splits: [
                    {
                        user_id: 55
                    },
                    {
                        user_id: 1
                    },
                    {
                        user_id: 2
                    }
                ]
            });

        expect(createResponse.status).toBe(201);

        const expenseId =
            createResponse.body.id;

        const editResponse = await agent
            .put(
                `/api/groups/${groupId}/expenses/${expenseId}`
            )
            .send({
                paid_by: 55,
                description: "Edited Expense",
                amount: "120.00",
                expense_date: "2026-09-28",
                split_type: "equal",
                splits: [
                    {
                        user_id: 55
                    },
                    {
                        user_id: 1
                    },
                    {
                        user_id: 2
                    }
                ]
            });

        expect(editResponse.status).toBe(200);

        expect(
            editResponse.body.description
        ).toBe("Edited Expense");

        expect(
            editResponse.body.amount_paise
        ).toBe(12000);

        const expense =
            await getExpenseById(expenseId);

        expect(expense.description).toBe(
            "Edited Expense"
        );

        expect(
            Number(expense.amount_paise)
        ).toBe(12000);

        const splits =
            await getSplitsByExpenseId(
                expenseId
            );

        expect(splits).toHaveLength(3);

        for (const split of splits) {
            expect(
                Number(
                    split.share_amount_paise
                )
            ).toBe(4000);
        }
    });

    it("should recompute balances after an expense is edited", async () => {
        const agent = await loginAsGroupOwner();

        const createResponse = await agent
            .post(`/api/groups/${groupId}/expenses`)
            .send({
                paid_by: 55,
                description: "Balance Edit Test",
                amount: "90.00",
                expense_date: "2026-09-28",
                split_type: "equal",
                splits: [
                    {
                        user_id: 55
                    },
                    {
                        user_id: 1
                    },
                    {
                        user_id: 2
                    }
                ]
            });

        expect(createResponse.status).toBe(201);

        const expenseId =
            createResponse.body.id;

        await agent
            .put(
                `/api/groups/${groupId}/expenses/${expenseId}`
            )
            .send({
                paid_by: 55,
                description:
                    "Balance Edit Test Updated",
                amount: "120.00",
                expense_date: "2026-09-28",
                split_type: "equal",
                splits: [
                    {
                        user_id: 55
                    },
                    {
                        user_id: 1
                    },
                    {
                        user_id: 2
                    }
                ]
            })
            .expect(200);

        const balances =
            await getGroupBalances(groupId);

        const balanceMap = new Map(
            balances.map((balance) => [
                Number(balance.user_id),
                Number(balance.balance_paise)
            ])
        );

        expect(balanceMap.get(55)).toBe(8000);
        expect(balanceMap.get(1)).toBe(-4000);
        expect(balanceMap.get(2)).toBe(-4000);

        const totalBalance = balances.reduce(
            (sum, balance) =>
                sum +
                Number(balance.balance_paise),
            0
        );

        expect(totalBalance).toBe(0);
    });

    it("should delete an expense and recompute balances", async () => {
        const agent = await loginAsGroupOwner();

        const createResponse = await agent
            .post(`/api/groups/${groupId}/expenses`)
            .send({
                paid_by: 55,
                description: "Delete Test",
                amount: "90.00",
                expense_date: "2026-09-28",
                split_type: "equal",
                splits: [
                    {
                        user_id: 55
                    },
                    {
                        user_id: 1
                    },
                    {
                        user_id: 2
                    }
                ]
            });

        expect(createResponse.status).toBe(201);

        const expenseId =
            createResponse.body.id;

        const deleteResponse = await agent
            .delete(
                `/api/groups/${groupId}/expenses/${expenseId}`
            );

        expect(deleteResponse.status).toBe(200);

        expect(
            deleteResponse.body.message
        ).toBe(
            "Expense deleted successfully"
        );

        const expense =
            await getExpenseById(expenseId);

        expect(expense).toBeUndefined();

        const splits =
            await getSplitsByExpenseId(
                expenseId
            );

        expect(splits).toHaveLength(0);

        const balances =
            await getGroupBalances(groupId);

        for (const balance of balances) {
            expect(
                Number(balance.balance_paise)
            ).toBe(0);
        }
    });

    it("should reject edit and delete attempts from a non-member", async () => {
        const owner =
            await loginAsGroupOwner();

        const createResponse = await owner
            .post(`/api/groups/${groupId}/expenses`)
            .send({
                paid_by: 55,
                description:
                    "Authorization Test",
                amount: "30.00",
                expense_date: "2026-09-28",
                split_type: "equal",
                splits: [
                    {
                        user_id: 55
                    }
                ]
            });

        expect(createResponse.status).toBe(201);

        const expenseId =
            createResponse.body.id;

        const nonMember =
            await loginAsNonMember();

        const editResponse = await nonMember
            .put(
                `/api/groups/${groupId}/expenses/${expenseId}`
            )
            .send({
                paid_by: 55,
                description:
                    "Unauthorized Edit",
                amount: "50.00",
                expense_date: "2026-09-28",
                split_type: "equal",
                splits: [
                    {
                        user_id: 55
                    }
                ]
            });

        expect(editResponse.status).toBe(403);

        expect(editResponse.body.error).toBe(
            "You are not a member of this group"
        );

        const deleteResponse =
            await nonMember
                .delete(
                    `/api/groups/${groupId}/expenses/${expenseId}`
                );

        expect(
            deleteResponse.status
        ).toBe(403);

        expect(
            deleteResponse.body.error
        ).toBe(
            "You are not a member of this group"
        );
    });
});