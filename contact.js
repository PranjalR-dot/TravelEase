
const connectDB = require("../config/db");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

function verifyAdmin(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return false;
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.role === "admin";
    } catch (error) {
        return false;
    }
}

function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify(data));
}

async function contactRoute(req, res) {
    try {
        // Submit a contact message
        if (req.method === "POST" && req.url === "/api/contact") {
            let body = "";

            req.on("data", (chunk) => {
                body += chunk.toString();

                if (body.length > 10000) {
                    sendJSON(res, 413, {
                        success: false,
                        message: "Message is too large."
                    });
                    req.destroy();
                }
            });

            req.on("end", async () => {
                try {
                    const data = JSON.parse(body);

                    const name = String(data.name || "").trim();
                    const email = String(data.email || "").trim();
                    const subject = String(data.subject || "").trim();
                    const message = String(data.message || "").trim();

                    if (!name || !email || !subject || !message) {
                        return sendJSON(res, 400, {
                            success: false,
                            message: "Please fill in all fields."
                        });
                    }

                    if (
                        name.length > 100 ||
                        email.length > 254 ||
                        subject.length > 200 ||
                        message.length > 5000 ||
                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                    ) {
                        return sendJSON(res, 400, {
                            success: false,
                            message: "Please check your details and try again."
                        });
                    }

                    const db = await connectDB();

                    await db.collection("contactMessages").insertOne({
                        name,
                        email,
                        subject,
                        message,
                        createdAt: new Date(),
                        read: false
                    });

                    return sendJSON(res, 201, {
                        success: true,
                        message: "Your message has been sent successfully!"
                    });
                } catch (error) {
                    console.error(
                        "Contact submission error:",
                        error.message
                    );

                    return sendJSON(res, 500, {
                        success: false,
                        message: "Unable to send your message right now."
                    });
                }
            });

            return true;
        }

        // Retrieve messages: admin only
        if (
            req.method === "GET" &&
            req.url === "/api/contact-messages"
        ) {
            if (!verifyAdmin(req)) {
                return sendJSON(res, 401, {
                    success: false,
                    message: "Admin authentication required."
                });
            }

            const db = await connectDB();

            const messages = await db
                .collection("contactMessages")
                .find({})
                .sort({ createdAt: -1 })
                .toArray();

            return sendJSON(res, 200, {
                success: true,
                messages
            });
        }

        // Mark a contact message as read: admin only
        if (
            req.method === "PATCH" &&
            /^\/api\/contact-messages\/[a-f\d]{24}\/read$/i.test(req.url)
        ) {
            if (!verifyAdmin(req)) {
                return sendJSON(res, 401, {
                    success: false,
                    message: "Admin authentication required."
                });
            }

            const messageId = req.url.split("/")[3];

            const db = await connectDB();

            const result = await db
                .collection("contactMessages")
                .updateOne(
                    { _id: new ObjectId(messageId) },
                    { $set: { read: true } }
                );

            if (result.matchedCount === 0) {
                return sendJSON(res, 404, {
                    success: false,
                    message: "Contact message not found."
                });
            }

            return sendJSON(res, 200, {
                success: true,
                message: "Message marked as read."
            });
        }

        return false;
    } catch (error) {
        console.error("Contact API error:", error.message);

        if (!res.headersSent) {
            sendJSON(res, 500, {
                success: false,
                message: "Server error."
            });
        }

        return true;
    }
}

module.exports = contactRoute;
