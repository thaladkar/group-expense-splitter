import { describe, it, expect } from "vitest";

const {
    calculateSettlements
} = require("../services/settlementAlgorithm");

describe("Settlement Algorithm", () => {
    it("should calculate settlements between debtors and creditors", () => {
        const balances = [
            {
                user_id: 1,
                name: "Aditi",
                balance_paise: 50000
            },
            {
                user_id: 2,
                name: "Rohan",
                balance_paise: -30000
            },
            {
                user_id: 3,
                name: "Neha",
                balance_paise: -20000
            }
        ];

        const settlements =
            calculateSettlements(balances);

        expect(settlements).toEqual([
            {
                paid_by: 2,
                paid_to: 1,
                amount_paise: 30000
            },
            {
                paid_by: 3,
                paid_to: 1,
                amount_paise: 20000
            }
        ]);
    });

    it("should return an empty array when everyone has zero balance", () => {
        const balances = [
            {
                user_id: 1,
                name: "Aditi",
                balance_paise: 0
            },
            {
                user_id: 2,
                name: "Rohan",
                balance_paise: 0
            }
        ];

        const settlements =
            calculateSettlements(balances);

        expect(settlements).toEqual([]);
    });

    it("should handle one debtor and one creditor", () => {
        const balances = [
            {
                user_id: 1,
                name: "Aditi",
                balance_paise: 10000
            },
            {
                user_id: 2,
                name: "Rohan",
                balance_paise: -10000
            }
        ];

        const settlements =
            calculateSettlements(balances);

        expect(settlements).toEqual([
            {
                paid_by: 2,
                paid_to: 1,
                amount_paise: 10000
            }
        ]);
    });
});