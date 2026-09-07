/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("expenses", function(table) {
        table.increments("id").primary();

        table
            .integer("group_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("groups");

        table
            .integer("paid_by")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("users");

        table.string("description", 1000).notNullable();

        table.bigInteger("amount_paise").unsigned().notNullable();

        table.date("expense_date").notNullable();

        table
            .enum("split_type", ["equal", "exact", "percentage"])
            .notNullable();

        table.timestamp("created_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("expenses");
};