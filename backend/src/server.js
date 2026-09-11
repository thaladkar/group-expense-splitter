const express = require("express");
const session = require("express-session");

const {
    register,
    login,
    logout
} = require("./controllers/authentication");

const {
    validateRegistration,
    validateLogin
} = require("./validators/authentication");

const groupRoutes = require("./routes/groups");

const app = express();

app.use(express.json());

app.use(
    session({
        secret: "development-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax"
        }
    })
);

// Authentication routes
app.post(
    "/api/auth/register",
    validateRegistration,
    register
);

app.post(
    "/api/auth/login",
    validateLogin,
    login
);

app.post("/api/auth/logout", logout);

// Group routes
app.use("/api/groups", groupRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Group Expense Splitter API is running"
    });
});

const PORT = 3000;

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
    console.error("Server error:", error);
});