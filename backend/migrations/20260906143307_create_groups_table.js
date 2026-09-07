/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("groups", function(table) {
        table.increments("id").primary();
        table.string("name", 100).notNullable();
        table
            .integer("created_by")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("users");
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("groups");
};