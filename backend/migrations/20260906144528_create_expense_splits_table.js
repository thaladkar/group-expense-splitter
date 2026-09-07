/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("expense_splits", function(table) {
        table.increments("id").primary();

        table
            .integer("expense_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("expenses");

        table
            .integer("user_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("users");

        table.bigInteger("split_value").unsigned().notNullable();

        table.bigInteger("share_amount_paise").unsigned().notNullable();

        table.timestamp("created_at").defaultTo(knex.fn.now());

        table.unique(["expense_id", "user_id"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("expense_splits");
};