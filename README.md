# Group Expense Splitter & Settlement Tracker

A web application for splitting shared expenses between group members and tracking settlements.

## Project Status

**Phase 1 - Data Layer and Core API - Complete**

* Database schema and Knex migrations completed
* MySQL database connection configured
* Authentication and authorization implemented
* Groups and memberships implemented
* Expense recording and splitting implemented
* Member balance calculation implemented
* Settlement calculation and recording implemented
* Sample seed data added
* API tests added
* Query function tests completed
* **45/45 tests passing**

## Tech Stack

* Frontend: React + Vite
* Backend: Node.js + Express
* Database: MySQL
* Database Driver: mysql2
* Migrations: Knex
* Authentication: express-session + bcrypt
* Testing: Vitest + Supertest + React Testing Library
* Deployment: Railway
* Version Control: Git + GitHub

## Features

* User registration and login
* Create and manage groups
* Add and remove group members
* Record shared expenses
* Split expenses equally, by exact amount, or by percentage
* View member balances
* Generate simplified settlement plans
* Record settlements
* View group activity history

## Project Structure

```text
group-expense-splitter/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── queries/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── tests/
│   │   └── server.js
│   ├── migrations/
│   ├── seeds/
│   └── package.json
├── docs/
├── .gitignore
└── README.md
```

## Database

The application uses MySQL with Knex migrations.

Money values are stored as integer paise using `BIGINT` rather than floating-point or decimal values.

The main database tables are:

* Users
* Groups
* Memberships
* Expenses
* Expense Splits
* Settlements

## API

The backend provides API endpoints for:

* User registration and login
* Creating and viewing groups
* Managing group members
* Creating and viewing expenses
* Viewing group balances
* Generating suggested settlements
* Recording settlements

Authentication uses `express-session`.

## Seed Data

Sample data can be loaded using the Knex seed command:

```bash
npx knex seed:run
```

The seed creates sample users, groups, memberships, expenses, expense splits, and settlements.

## Testing

The backend uses Vitest and Supertest for automated testing.

Current test result:

```text
Test Files  12 passed (12)
Tests       45 passed (45)
```

To run the tests:

```bash
npm test -- --run
```

## Documentation

The project documentation includes:

* ER diagram
* API contract

These are available in the `docs` folder.

## Deployment

Deployment to Railway is planned for a later phase.
