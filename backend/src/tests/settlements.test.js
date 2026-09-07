import { describe, it, expect } from "vitest";

const {
    createSettlement,
    getSettlementsByGroupId,
    getSettlementById
} = require("../queries/settlements");

const {
    createUser
} = require("../queries/users");

describe("Settlement Queries", () => {
    it("should create a settlement", async () => {
        const user1Id = await createUser(
            "Settlement User 1",
            `settlement1_${Date.now()}@example.com`,
            "hashedpassword"
        );

        const user2Id = await createUser(
            "Settlement User 2",
            `settlement2_${Date.now()}@example.com`,
            "hashedpassword"
        );

        const settlementId = await createSettlement(
            1,
            user1Id,
            user2Id,
            5000
        );

        expect(settlementId).toBeGreaterThan(0);
    });

    it("should get settlements by group ID", async () => {
        const user1Id = await createUser(
            "Settlement User 3",
            `settlement3_${Date.now()}@example.com`,
            "hashedpassword"
        );

        const user2Id = await createUser(
            "Settlement User 4",
            `settlement4_${Date.now()}@example.com`,
            "hashedpassword"
        );

        await createSettlement(
            1,
            user1Id,
            user2Id,
            4000
        );

        const settlements = await getSettlementsByGroupId(1);

        expect(Array.isArray(settlements)).toBe(true);
        expect(settlements.length).toBeGreaterThan(0);
    });

    it("should get a settlement by ID", async () => {
        const user1Id = await createUser(
            "Settlement User 5",
            `settlement5_${Date.now()}@example.com`,
            "hashedpassword"
        );

        const user2Id = await createUser(
            "Settlement User 6",
            `settlement6_${Date.now()}@example.com`,
            "hashedpassword"
        );

        const settlementId = await createSettlement(
            1,
            user1Id,
            user2Id,
            3000
        );

        const settlement = await getSettlementById(settlementId);

        expect(settlement).toBeDefined();
        expect(settlement.id).toBe(settlementId);
    });
});