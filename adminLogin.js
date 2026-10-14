
const jwt = require("jsonwebtoken");

async function adminLoginRoute(req, res) {

    if (req.method !== "POST" || req.url !== "/api/admin-login") {
        return false;
    }

    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", async () => {

        try {
            const loginData = JSON.parse(body);

            if (
                loginData.username !== process.env.ADMIN_USERNAME ||
                loginData.password !== process.env.ADMIN_PASSWORD
            ) {
                res.writeHead(401, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false,
                    message: "Invalid Admin Username or Password."
                }));

                return;
            }

            const secret = process.env.JWT_SECRET;

            if (!secret) {
                throw new Error("JWT_SECRET is not configured.");
            }

            const token = jwt.sign(
                { role: "admin" },
                secret,
                { expiresIn: "2h" }
            );

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: true,
                message: "Admin Login Successful!",
                token: token
            }));

        } catch (error) {
            console.error("Admin Login Error:", error.message);

            res.writeHead(500, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: false,
                message: "Server error during admin login."
            }));
        }
    });

    return true;
}

module.exports = adminLoginRoute;
