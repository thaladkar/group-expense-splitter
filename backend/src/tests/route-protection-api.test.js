import { describe, it, expect } from "vitest";
import request from "supertest";

const app = require("../server");

describe("Route Protection API", () => {
    it("should reject unauthenticated group creation", async () => {
        const response = await request(app)
            .post("/api/groups")
            .send({
                name: "Unauthorized Group"
            });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe(
            "Authentication required"
        );
    });

    it("should reject unauthenticated group listing", async () => {
        const response = await request(app)
            .get("/api/groups");

        expect(response.status).toBe(401);
        expect(response.body.error).toBe(
            "Authentication required"
        );
    });

    it("should reject unauthenticated group access", async () => {
        const response = await request(app)
            .get("/api/groups/8");

        expect(response.status).toBe(401);
        expect(response.body.error).toBe(
            "Authentication required"
        );
    });

    it("should reject unauthenticated member listing", async () => {
        const response = await request(app)
            .get("/api/groups/8/members");

        expect(response.status).toBe(401);
        expect(response.body.error).toBe(
            "Authentication required"
        );
    });

    it("should reject unauthenticated member creation", async () => {
        const response = await request(app)
            .post("/api/groups/8/members")
            .send({
                user_id: 54
            });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe(
            "Authentication required"
        );
    });

    it("should reject unauthenticated member removal", async () => {
        const response = await request(app)
            .delete("/api/groups/8/members/54");

        expect(response.status).toBe(401);
        expect(response.body.error).toBe(
            "Authentication required"
        );
    });

    it("should reject unauthenticated expense listing", async () => {
        const response = await request(app)
            .get("/api/groups/8/expenses");

        expect(response.status).toBe(401);
        expect(response.body.error).toBe(
            "Authentication required"
        );
    });

    it("should reject unauthenticated expense creation", async () => {
        const response = await request(app)
            .post("/api/groups/8/expenses")
            .send({
                paid_by: 55,
                description: "Unauthorized Expense",
                amount: "100.00",
                expense_date: "2026-09-13",
                split_type: "equal",
                splits: [
                    {
                        user_id: 55
                    }
                ]
            });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe(
            "Authentication required"
        );
    });

    it("should reject unauthenticated balance access", async () => {
        const response = await request(app)
            .get("/api/groups/8/balances");

        expect(response.status).toBe(401);
        expect(response.body.error).toBe(
            "Authentication required"
        );
    });

    it("should reject unauthenticated settlement listing", async () => {
        const response = await request(app)
            .get("/api/groups/8/settlements");

        expect(response.status).toBe(401);
        expect(response.body.error).toBe(
            "Authentication required"
        );
    });

    it("should reject unauthenticated settlement creation", async () => {
        const response = await request(app)
            .post("/api/groups/8/settlements")
            .send({
                paid_by: 55,
                paid_to: 54,
                amount: "100.00"
            });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe(
            "Authentication required"
        );
    });
});