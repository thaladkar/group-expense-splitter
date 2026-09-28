import { describe, it, expect } from "vitest";

const {
    addMember,
    removeMember,
    getGroupMembers,
    isUserMember
} = require("../queries/memberships");

describe("Membership Queries", () => {
    it("should add a member to a group", async () => {
        // User 4 exists in the seed data but is not
        // originally a member of Group 1.
        await removeMember(4, 1);

        try {
            await addMember(4, 1);

            const member = await isUserMember(
                4,
                1
            );

            expect(member).toBe(true);
        } finally {
            // Restore the original seeded state.
            await removeMember(4, 1);
        }
    });

    it("should get group members", async () => {
        const members =
            await getGroupMembers(1);

        expect(
            Array.isArray(members)
        ).toBe(true);

        expect(
            members.length
        ).toBeGreaterThan(0);
    });

    it("should check if a user is a member of a group", async () => {
        // User 1 is part of Group 1 in the seed data.
        const member = await isUserMember(
            1,
            1
        );

        expect(member).toBe(true);
    });

    it("should remove a member from a group", async () => {
        await removeMember(4, 1);

        await addMember(4, 1);

        const beforeRemoval =
            await isUserMember(
                4,
                1
            );

        expect(beforeRemoval).toBe(true);

        await removeMember(4, 1);

        const afterRemoval =
            await isUserMember(
                4,
                1
            );

        expect(afterRemoval).toBe(false);
    });
});