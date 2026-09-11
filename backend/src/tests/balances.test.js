import { describe, it, expect } from "vitest";

const {
    getGroupBalances
} = require("../queries/balances");

describe("Balance Queries", () => {
    it("should get balances for a group", async () => {
        const balances = await getGroupBalances(5);

        expect(Array.isArray(balances)).toBe(true);
        expect(balances.length).toBeGreaterThan(0);

        expect(balances[0]).toHaveProperty("user_id");
        expect(balances[0]).toHaveProperty("name");
        expect(balances[0]).toHaveProperty("email");
        expect(balances[0]).toHaveProperty("balance_paise");
    });
});