import { describe, it, expect } from "vitest";

const {
    createGroup,
    getGroupById,
    getGroupsByUserId
} = require("../queries/groups");

describe("Group Queries", () => {
    it("should create a group", async () => {
        const groupId = await createGroup(
            "Test Group",
            1
        );

        expect(groupId).toBeGreaterThan(0);
    });

    it("should get a group by ID", async () => {
        const group = await getGroupById(1);

        expect(group).toBeDefined();
        expect(group.id).toBe(1);
    });

    it("should get groups by user ID", async () => {
        const groups = await getGroupsByUserId(1);

        expect(Array.isArray(groups)).toBe(true);
    });
});