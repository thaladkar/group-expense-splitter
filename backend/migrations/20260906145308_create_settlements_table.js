/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("settlements", function(table) {
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

        table
            .integer("paid_to")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("users");

        table.bigInteger("amount_paise").unsigned().notNullable();

        table.timestamp("paid_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("settlements");
};