/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("memberships", function(table) {
        table.increments("id").primary();

        table
            .integer("user_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("users");

        table
            .integer("group_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("groups");

        table.timestamp("created_at").defaultTo(knex.fn.now());

        table.unique(["user_id", "group_id"]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("memberships");
};