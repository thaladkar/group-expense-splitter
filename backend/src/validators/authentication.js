function validateRegistration(req, res, next) {
    const errors = {};

    const { name, email, password } = req.body;

    if (!name || name.trim() === "") {
        errors.name = "Name is required";
    }

    if (!email || email.trim() === "") {
        errors.email = "Email is required";
    } else if (!email.includes("@")) {
        errors.email = "Enter a valid email address";
    }

    if (!password || password.trim() === "") {
        errors.password = "Password is required";
    } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            errors: errors
        });
    }

    next();
}

module.exports = {
    validateRegistration
};