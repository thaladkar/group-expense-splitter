import { describe, it, expect } from "vitest";
import request from "supertest";

const app = require("../server");

describe("Balances API", () => {
    it("should reject unauthenticated balance request", async () => {
        const response = await request(app)
            .get("/api/groups/5/balances");

        expect(response.status).toBe(401);

        expect(response.body.error).toBe(
            "Authentication required"
        );
    });
});