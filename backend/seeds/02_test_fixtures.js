const bcrypt = require("bcrypt");

exports.seed = async function(knex) {
    const passwordHash = await bcrypt.hash(
        "password123",
        10
    );

    // Users used by authentication and API tests.
    await knex("users").insert([
        {
            id: 54,
            name: "Auth Test User",
            email: "authtest@example.com",
            password_hash: passwordHash
        },
        {
            id: 55,
            name: "Group Owner",
            email: "groupowner@example.com",
            password_hash: passwordHash
        }
    ]);

    // Groups used by balance and API tests.
    await knex("groups").insert([
        {
            id: 5,
            name: "Balance Test Group",
            created_by: 1
        },
        {
            id: 8,
            name: "API Test Group",
            created_by: 55
        }
    ]);

    // User 54 is intentionally NOT a member of Group 8.
    // Several authorisation tests depend on this.
    await knex("memberships").insert([
        {
            user_id: 1,
            group_id: 5
        },
        {
            user_id: 2,
            group_id: 5
        },
        {
            user_id: 3,
            group_id: 5
        },
        {
            user_id: 55,
            group_id: 8
        }
    ]);

    // Fixture used by the balance tests.
    await knex("expenses").insert({
        id: 5001,
        group_id: 5,
        paid_by: 1,
        description: "Balance Test Expense",
        amount_paise: 300000,
        expense_date: "2026-09-01",
        split_type: "equal"
    });

    await knex("expense_splits").insert([
        {
            expense_id: 5001,
            user_id: 1,
            split_value: 100000,
            share_amount_paise: 100000
        },
        {
            expense_id: 5001,
            user_id: 2,
            split_value: 100000,
            share_amount_paise: 100000
        },
        {
            expense_id: 5001,
            user_id: 3,
            split_value: 100000,
            share_amount_paise: 100000
        }
    ]);
};