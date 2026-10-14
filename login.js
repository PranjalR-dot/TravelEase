const connectDB = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function loginRoute(req, res) {

    if (req.method === "POST" && req.url === "/api/login") {

        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", async () => {

            try {
                const loginData = JSON.parse(body);

                if (!loginData.email || !loginData.password) {
                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: false,
                        message: "Email and password are required."
                    }));

                    return;
                }

                const db = await connectDB();
                const userCollection = db.collection("users");

                const user = await userCollection.findOne({
                    email: loginData.email
                });

                if (!user) {
                    res.writeHead(401, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: false,
                        message: "Invalid email or password."
                    }));

                    return;
                }

                const passwordMatch = await bcrypt.compare(
                    loginData.password,
                    user.password
                );

                if (!passwordMatch) {
                    res.writeHead(401, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: false,
                        message: "Invalid email or password."
                    }));

                    return;
                }

                const secret = process.env.JWT_SECRET;

                if (!secret) {
                    throw new Error("JWT_SECRET is not configured.");
                }

                const token = jwt.sign(
                    {
                        userId: user._id.toString(),
                        email: user.email
                    },
                    secret,
                    { expiresIn: "2h" }
                );

                res.writeHead(200, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: true,
                    message: "Login Successful!!",
                    token: token,
                    user: {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        mobile: user.mobile
                    }
                }));

            } catch (error) {
                console.error("Login Error:", error.message);

                res.writeHead(500, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false,
                    message: "Server error during login."
                }));
            }
        });

        return true;
    }

    return false;
}

module.exports = loginRoute;