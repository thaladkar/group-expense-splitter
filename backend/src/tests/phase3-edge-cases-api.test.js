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
    getSplitsByExpenseId
} = require("../queries/expenseSplits");

const {
    getGroupBalances
} = require("../queries/balances");

let groupId;
let groupNumber = 0;

async function loginAsOwner() {
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
        `Phase 3 Edge Case Group ${groupNumber}`,
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

describe("Phase 3 Splitting Edge Cases", () => {
    it("should store an awkward exact split without losing a paise", async () => {
        const agent = await loginAsOwner();

        const response = await agent
            .post(`/api/groups/${groupId}/expenses`)
            .send({
                paid_by: 55,
                description: "Awkward Exact Split",
                amount: "100.01",
                expense_date: "2026-09-28",
                split_type: "exact",
                splits: [
                    {
                        user_id: 55,
                        amount: "33.33"
                    },
                    {
                        user_id: 1,
                        amount: "33.33"
                    },
                    {
                        user_id: 2,
                        amount: "33.35"
                    }
                ]
            });

        expect(response.status).toBe(201);
        expect(response.body.amount_paise).toBe(10001);

        const splits =
            await getSplitsByExpenseId(
                response.body.id
            );

        const shares = new Map(
            splits.map((split) => [
                Number(split.user_id),
                Number(split.share_amount_paise)
            ])
        );

        expect(shares.get(55)).toBe(3333);
        expect(shares.get(1)).toBe(3333);
        expect(shares.get(2)).toBe(3335);

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

    it("should reject an exact split that is one paise short", async () => {
        const agent = await loginAsOwner();

        const response = await agent
            .post(`/api/groups/${groupId}/expenses`)
            .send({
                paid_by: 55,
                description:
                    "Incorrect Exact Total",
                amount: "100.01",
                expense_date: "2026-09-28",
                split_type: "exact",
                splits: [
                    {
                        user_id: 55,
                        amount: "33.33"
                    },
                    {
                        user_id: 1,
                        amount: "33.33"
                    },
                    {
                        user_id: 2,
                        amount: "33.34"
                    }
                ]
            });

        expect(response.status).toBe(400);

        expect(response.body.error).toBe(
            "Exact split amounts must add up to the expense amount"
        );
    });

    it("should handle 33.33, 33.33 and 33.34 percent with an awkward total", async () => {
        const agent = await loginAsOwner();

        const response = await agent
            .post(`/api/groups/${groupId}/expenses`)
            .send({
                paid_by: 55,
                description:
                    "Percentage Thirds",
                amount: "100.01",
                expense_date: "2026-09-28",
                split_type: "percentage",
                splits: [
                    {
                        user_id: 55,
                        percentage: "33.33"
                    },
                    {
                        user_id: 1,
                        percentage: "33.33"
                    },
                    {
                        user_id: 2,
                        percentage: "33.34"
                    }
                ]
            });

        expect(response.status).toBe(201);

        const splits =
            await getSplitsByExpenseId(
                response.body.id
            );

        const shares = new Map(
            splits.map((split) => [
                Number(split.user_id),
                Number(split.share_amount_paise)
            ])
        );

        expect(shares.get(55)).toBe(3333);
        expect(shares.get(1)).toBe(3333);
        expect(shares.get(2)).toBe(3335);

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

    it("should keep total balances at zero after an awkward equal split", async () => {
        const agent = await loginAsOwner();

        const response = await agent
            .post(`/api/groups/${groupId}/expenses`)
            .send({
                paid_by: 55,
                description:
                    "Awkward Balance Test",
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

        const balances =
            await getGroupBalances(groupId);

        const balanceMap = new Map(
            balances.map((balance) => [
                Number(balance.user_id),
                Number(balance.balance_paise)
            ])
        );

        expect(balanceMap.get(55)).toBe(6667);
        expect(balanceMap.get(1)).toBe(-3334);
        expect(balanceMap.get(2)).toBe(-3333);

        const totalBalance = balances.reduce(
            (sum, balance) =>
                sum +
                Number(balance.balance_paise),
            0
        );

        expect(totalBalance).toBe(0);
    });

    it("should replace equal splits with exact splits when an expense is edited", async () => {
        const agent = await loginAsOwner();

        const createResponse = await agent
            .post(`/api/groups/${groupId}/expenses`)
            .send({
                paid_by: 55,
                description:
                    "Split Type Edit Test",
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
                description:
                    "Changed To Exact",
                amount: "100.01",
                expense_date: "2026-09-28",
                split_type: "exact",
                splits: [
                    {
                        user_id: 55,
                        amount: "20.00"
                    },
                    {
                        user_id: 1,
                        amount: "30.00"
                    },
                    {
                        user_id: 2,
                        amount: "50.01"
                    }
                ]
            });

        expect(editResponse.status).toBe(200);

        expect(
            editResponse.body.split_type
        ).toBe("exact");

        const splits =
            await getSplitsByExpenseId(
                expenseId
            );

        expect(splits).toHaveLength(3);

        const shares = new Map(
            splits.map((split) => [
                Number(split.user_id),
                Number(split.share_amount_paise)
            ])
        );

        expect(shares.get(55)).toBe(2000);
        expect(shares.get(1)).toBe(3000);
        expect(shares.get(2)).toBe(5001);

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

    it("should protect edit and delete routes from unauthenticated users", async () => {
        const editResponse = await request(app)
            .put(
                `/api/groups/${groupId}/expenses/1`
            )
            .send({
                paid_by: 55,
                description:
                    "Unauthorised Edit",
                amount: "10.00",
                expense_date: "2026-09-28",
                split_type: "equal",
                splits: [
                    {
                        user_id: 55
                    }
                ]
            });

        expect(editResponse.status).toBe(401);

        expect(editResponse.body.error).toBe(
            "Authentication required"
        );

        const deleteResponse =
            await request(app)
                .delete(
                    `/api/groups/${groupId}/expenses/1`
                );

        expect(
            deleteResponse.status
        ).toBe(401);

        expect(
            deleteResponse.body.error
        ).toBe(
            "Authentication required"
        );
    });
});