# Group Expense Splitter & Settlement Tracker

A backend application for splitting shared expenses between group members and tracking balances and settlements. A React frontend is planned for a later stage.

## Project Status

**Current implementation: Phase 3 - The Splitting Engine**

Completed so far:

- Database schema and Knex migrations
- MySQL database connection
- User registration and login
- Password hashing using bcrypt
- Session-based authentication
- Route protection and group authorisation
- Group and membership management
- Expense creation
- Equal expense splitting
- Exact-amount expense splitting
- Percentage expense splitting
- Validation of split totals
- Deterministic handling of rounding and remaining paise
- Per-member and per-group balance calculation
- Expense editing
- Expense deletion
- Automatic balance recomputation after expense changes
- Settlement calculation and recording
- Reproducible seed and test fixture data
- Automated API and query tests

Latest automated test result:

```text
Test Files  17 passed (17)
Tests       81 passed (81)
```

The frontend has not been implemented yet. Development so far has focused on the backend API and its automated tests.

## Tech Stack

- **Frontend:** React + Vite (planned, not implemented)
- **Backend:** Node.js + Express
- **Database:** MySQL
- **Database Driver:** mysql2
- **Database Migrations:** Knex
- **Authentication:** express-session + bcrypt
- **Testing:** Vitest + Supertest
- **Frontend Testing:** React Testing Library (planned for frontend development)
- **Deployment:** Railway (planned)
- **Version Control:** Git + GitHub

## Features

- User registration and login
- Session-based authentication
- Create and manage groups
- Add and remove group members
- Record shared expenses
- Split expenses equally
- Split expenses by exact amount
- Split expenses by percentage
- Handle rounding and remaining paise deterministically
- Edit existing expenses
- Delete expenses
- View per-member balances
- Recalculate balances after expense changes
- Generate simplified settlement plans
- Record settlements
- Protect group data from users who are not members

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
│   │   ├── 01_sample_data.js
│   │   └── 02_test_fixtures.js
│   └── package.json
├── docs/
├── .gitignore
└── README.md
```

The structure above reflects the current repository. The frontend directory will be added when frontend development begins.

## Database

The application uses MySQL with Knex migrations.

Money is stored as integer paise using `BIGINT`.

Floating-point or decimal values are not used for stored money values.

The main database tables are:

- Users
- Groups
- Memberships
- Expenses
- Expense Splits
- Settlements

## Authentication and Authorisation

Authentication uses `express-session` and bcrypt.

Passwords are stored as bcrypt hashes.

Session cookies use:

- `httpOnly`
- `sameSite`
- Session expiry

The session secret is read from the `SESSION_SECRET` environment variable rather than being hardcoded in the server code.

Protected routes require the user to be logged in.

Group routes also check that the logged-in user is a member of the requested group.

- Unauthenticated requests return `401`.
- Authenticated users attempting to access groups they are not members of return `403`.

## Splitting Engine

The application supports three expense splitting methods.

### Equal Split

The expense amount is divided between all selected members.

When the amount cannot divide evenly, the remaining paise are distributed deterministically so that the final split always equals the original expense amount.

Example:

```text
₹100.01 split between 3 people

Person 1 = ₹33.34
Person 2 = ₹33.34
Person 3 = ₹33.33
```

The total remains exactly:

```text
₹100.01
```

### Exact Split

Each member is assigned an exact amount.

The API validates that all exact split amounts add up exactly to the expense total.

A difference of even one paise is rejected.

### Percentage Split

Each member is assigned a percentage of the expense.

The percentages must add up to exactly 100%.

Calculated amounts are converted to integer paise and any rounding remainder is distributed deterministically.

## Expense Editing and Deletion

Expenses can be edited using:

```text
PUT /api/groups/:groupId/expenses/:expenseId
```

When an expense is edited:

- Expense information is updated
- Previous expense splits are removed
- New splits are created
- Group balances are automatically recalculated from the latest database data

Expenses can be deleted using:

```text
DELETE /api/groups/:groupId/expenses/:expenseId
```

When an expense is deleted:

- Its expense splits are deleted
- The expense is deleted
- Group balances automatically reflect the change

Both routes require authentication and group membership.

## Balance Calculation

Balances are calculated using:

- Expenses paid by each member
- Expense shares owed by each member
- Settlements paid
- Settlements received

Balances are calculated from the current database records instead of being stored separately.

This means editing or deleting an expense automatically changes the calculated balances.

The sum of all member balances in a group should always equal zero.

## API

The backend currently provides API endpoints for:

- User registration
- User login
- User logout
- Creating groups
- Listing groups
- Viewing group details
- Adding members
- Viewing members
- Removing members
- Creating expenses
- Viewing expenses
- Editing expenses
- Deleting expenses
- Viewing group balances
- Generating suggested settlements
- Recording settlements

## Seed Data

Sample data can be loaded using:

```bash
npx knex seed:run
```

Run this command from inside the `backend` folder.

The seed files create:

- Sample users
- Groups
- Memberships
- Expenses
- Expense splits
- Settlements
- Reproducible fixtures required by automated tests

## Testing

The backend uses Vitest and Supertest.

The test suite currently covers:

- User queries
- Group queries
- Membership queries
- Expense queries
- Expense split queries
- Balance calculation
- Settlement queries
- Settlement algorithm
- Authentication
- Session handling
- Route protection
- Authorisation
- Expense validation
- Equal splitting
- Exact splitting
- Percentage splitting
- Awkward monetary values
- Rounding and remainder handling
- Expense editing
- Expense deletion
- Balance recomputation
- Unauthorised edit and delete attempts

Latest test-runner output:

```text
Test Files  17 passed (17)
Tests       81 passed (81)
```

To run the tests, open a terminal in the `backend` folder and run:

```bash
npm test -- --run
```

## Documentation

Project documentation includes:

- ER diagram
- API contract

These are available in the `docs` folder.

## Current Phase

The current implementation covers the main requirements of:

- Phase 1 - Data Layer and Core API
- Phase 2 - Authentication and Authorisation
- Phase 3 - The Splitting Engine

Exercise 5 from Phase 2 is still pending until the supplied buggy function is provided.

Phase 4 requirements will be reviewed against the existing settlement functionality before additional implementation work begins.

## Frontend

The planned frontend will use React and Vite.

Frontend development has not started yet. The current repository contains the backend implementation and project documentation.

## Deployment

Deployment to Railway is planned for a later phase. The application has not yet been documented as deployed.
