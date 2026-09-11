/**
 * Sample seed data for Group Expense Splitter
 *
 * Creates:
 * - 5 users
 * - 2 groups
 * - memberships
 * - expenses
 * - expense splits
 * - settlements
 *
 * Money is stored as integer paise.
 */

const bcrypt = require("bcrypt");

exports.seed = async function(knex) {
    // Clear existing data in reverse dependency order.
    await knex("settlements").del();
    await knex("expense_splits").del();
    await knex("expenses").del();
    await knex("memberships").del();
    await knex("groups").del();
    await knex("users").del();

    const passwordHash = await bcrypt.hash(
        "password123",
        10
    );

    // -------------------------
    // Users
    // -------------------------

    await knex("users").insert([
        {
            id: 1,
            name: "Aditi",
            email: "aditi@example.com",
            password_hash: passwordHash
        },
        {
            id: 2,
            name: "Rohan",
            email: "rohan@example.com",
            password_hash: passwordHash
        },
        {
            id: 3,
            name: "Neha",
            email: "neha@example.com",
            password_hash: passwordHash
        },
        {
            id: 4,
            name: "Rahul",
            email: "rahul@example.com",
            password_hash: passwordHash
        },
        {
            id: 5,
            name: "Priya",
            email: "priya@example.com",
            password_hash: passwordHash
        }
    ]);

    // -------------------------
    // Groups
    // -------------------------

    await knex("groups").insert([
        {
            id: 1,
            name: "Goa Trip",
            created_by: 1
        },
        {
            id: 2,
            name: "Weekend Dinner",
            created_by: 4
        }
    ]);

    // -------------------------
    // Memberships
    // -------------------------

    await knex("memberships").insert([
        // Goa Trip
        {
            user_id: 1,
            group_id: 1
        },
        {
            user_id: 2,
            group_id: 1
        },
        {
            user_id: 3,
            group_id: 1
        },

        // Weekend Dinner
        {
            user_id: 4,
            group_id: 2
        },
        {
            user_id: 5,
            group_id: 2
        },
        {
            user_id: 1,
            group_id: 2
        }
    ]);

    // -------------------------
    // Expenses
    // -------------------------

    await knex("expenses").insert([
        {
            id: 1,
            group_id: 1,
            paid_by: 1,
            description: "Hotel booking",
            amount_paise: 600000,
            expense_date: "2026-09-01",
            split_type: "equal"
        },
        {
            id: 2,
            group_id: 1,
            paid_by: 2,
            description: "Dinner",
            amount_paise: 300000,
            expense_date: "2026-09-02",
            split_type: "exact"
        },
        {
            id: 3,
            group_id: 2,
            paid_by: 4,
            description: "Restaurant bill",
            amount_paise: 250000,
            expense_date: "2026-09-05",
            split_type: "percentage"
        }
    ]);

    // -------------------------
    // Expense Splits
    // -------------------------

    await knex("expense_splits").insert([
        // Hotel booking: ₹6,000 equally between 3 people
        {
            expense_id: 1,
            user_id: 1,
            split_value: 200000,
            share_amount_paise: 200000
        },
        {
            expense_id: 1,
            user_id: 2,
            split_value: 200000,
            share_amount_paise: 200000
        },
        {
            expense_id: 1,
            user_id: 3,
            split_value: 200000,
            share_amount_paise: 200000
        },

        // Dinner: ₹3,000 exact split
        {
            expense_id: 2,
            user_id: 1,
            split_value: 100000,
            share_amount_paise: 100000
        },
        {
            expense_id: 2,
            user_id: 2,
            split_value: 150000,
            share_amount_paise: 150000
        },
        {
            expense_id: 2,
            user_id: 3,
            split_value: 50000,
            share_amount_paise: 50000
        },

        // Restaurant bill: ₹2,500 percentage split
        // Rahul: 40% = ₹1,000
        // Priya: 35% = ₹875
        // Aditi: 25% = ₹625
        {
            expense_id: 3,
            user_id: 4,
            split_value: 40,
            share_amount_paise: 100000
        },
        {
            expense_id: 3,
            user_id: 5,
            split_value: 35,
            share_amount_paise: 87500
        },
        {
            expense_id: 3,
            user_id: 1,
            split_value: 25,
            share_amount_paise: 62500
        }
    ]);

    // -------------------------
    // Settlements
    // -------------------------

    await knex("settlements").insert([
        {
            id: 1,
            group_id: 1,
            paid_by: 2,
            paid_to: 1,
            amount_paise: 50000
        },
        {
            id: 2,
            group_id: 2,
            paid_by: 5,
            paid_to: 4,
            amount_paise: 75000
        }
    ]);
};