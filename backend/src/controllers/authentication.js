const bcrypt = require("bcrypt");

const {
    createUser,
    getUserByEmail
} = require("../queries/users");

async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Name, email and password are required"
            });
        }

        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                error: "Email already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const userId = await createUser(
            name,
            email,
            passwordHash
        );

        return res.status(201).json({
            id: userId,
            name: name,
            email: email
        });
    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        req.session.userId = user.id;

        return res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            message: "Login successful"
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

async function logout(req, res) {
    req.session.destroy((error) => {
        if (error) {
            console.error("Logout error:", error);

            return res.status(500).json({
                error: "Internal server error"
            });
        }

        res.clearCookie("connect.sid");

        return res.status(200).json({
            message: "Logout successful"
        });
    });
}

module.exports = {
    register,
    login,
    logout
};