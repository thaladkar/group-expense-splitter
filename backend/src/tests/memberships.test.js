import { describe, it, expect } from "vitest";

const {
    addMember,
    removeMember,
    getGroupMembers,
    isUserMember
} = require("../queries/memberships");

describe("Membership Queries", () => {
    it("should add a member to a group", async () => {
        const membershipId = await addMember(1, 1);

        expect(membershipId).toBeGreaterThan(0);
    });

    it("should get group members", async () => {
        const members = await getGroupMembers(1);

        expect(Array.isArray(members)).toBe(true);
        expect(members.length).toBeGreaterThan(0);
    });

    it("should check if a user is a member of a group", async () => {
        const result = await isUserMember(1, 1);

        expect(result).toBe(true);
    });

    it("should remove a member from a group", async () => {
        const deletedRows = await removeMember(1, 1);

        expect(deletedRows).toBeGreaterThan(0);
    });
});