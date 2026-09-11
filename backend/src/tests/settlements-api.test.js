import { describe, it, expect } from "vitest";
import request from "supertest";

const app = require("../server");

const {
removeMember
} = require("../queries/memberships");

describe("Settlements API", () => {
it("should reject unauthenticated GET settlement request", async () => {
const response = await request(app)
.get("/api/groups/8/settlements");


    expect(response.status).toBe(401);

    expect(response.body.error).toBe(
        "Authentication required"
    );
});

it("should reject unauthenticated POST settlement request", async () => {
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

it("should reject a settlement when required fields are missing", async () => {
    const agent = request.agent(app);

    await agent
        .post("/api/auth/login")
        .send({
            email: "groupowner@example.com",
            password: "password123"
        });

    const response = await agent
        .post("/api/groups/8/settlements")
        .send({});

    expect(response.status).toBe(400);

    expect(response.body.error).toBe(
        "paid_by, paid_to and amount are required"
    );
});

it("should reject a settlement with an invalid amount", async () => {
    const agent = request.agent(app);

    await agent
        .post("/api/auth/login")
        .send({
            email: "groupowner@example.com",
            password: "password123"
        });

    const response = await agent
        .post("/api/groups/8/settlements")
        .send({
            paid_by: 55,
            paid_to: 54,
            amount: "100.123"
        });

    expect(response.status).toBe(400);

    expect(response.body.error).toBe(
        "Amount must be a positive number with at most 2 decimal places"
    );
});

it("should reject a settlement when payer and receiver are the same", async () => {
    const agent = request.agent(app);

    await agent
        .post("/api/auth/login")
        .send({
            email: "groupowner@example.com",
            password: "password123"
        });

    const response = await agent
        .post("/api/groups/8/settlements")
        .send({
            paid_by: 55,
            paid_to: 55,
            amount: "100.00"
        });

    expect(response.status).toBe(400);

    expect(response.body.error).toBe(
        "paid_by and paid_to must be different users"
    );
});

it("should reject a settlement when payer is not a group member", async () => {
    const agent = request.agent(app);

    await agent
        .post("/api/auth/login")
        .send({
            email: "groupowner@example.com",
            password: "password123"
        });

    const response = await agent
        .post("/api/groups/8/settlements")
        .send({
            paid_by: 54,
            paid_to: 55,
            amount: "100.00"
        });

    expect(response.status).toBe(400);

    expect(response.body.error).toBe(
        "Payer must be a member of the group"
    );
});

it("should reject a settlement when receiver is not a group member", async () => {
    const agent = request.agent(app);

    await agent
        .post("/api/auth/login")
        .send({
            email: "groupowner@example.com",
            password: "password123"
        });

    const response = await agent
        .post("/api/groups/8/settlements")
        .send({
            paid_by: 55,
            paid_to: 54,
            amount: "100.00"
        });

    expect(response.status).toBe(400);

    expect(response.body.error).toBe(
        "Receiver must be a member of the group"
    );
});

it("should record a valid settlement", async () => {
    const agent = request.agent(app);

    let membershipAdded = false;

    try {
        await agent
            .post("/api/auth/login")
            .send({
                email: "groupowner@example.com",
                password: "password123"
            });

        const addMemberResponse = await agent
            .post("/api/groups/8/members")
            .send({
                user_id: 54
            });

        expect(addMemberResponse.status).toBe(201);

        membershipAdded = true;

        const response = await agent
            .post("/api/groups/8/settlements")
            .send({
                paid_by: 55,
                paid_to: 54,
                amount: "100.00"
            });

        expect(response.status).toBe(201);

        expect(response.body.group_id).toBe(8);
        expect(response.body.paid_by).toBe(55);
        expect(response.body.paid_to).toBe(54);
        expect(response.body.amount_paise).toBe(10000);
    } finally {
        if (membershipAdded) {
            await removeMember(54, 8);
        }
    }
});

});
