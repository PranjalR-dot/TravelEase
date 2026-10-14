
const connectDB = require("../config/db");
const jwt = require("jsonwebtoken");

function sendJSON(res, statusCode, data) {
    if (res.writableEnded || res.destroyed) return;

    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify(data));
}

function parseDate(value) {
    if (!value) return null;

    const date = value instanceof Date
        ? value
        : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeHistory(existing) {
    const rawHistory = Array.isArray(existing.visitHistory)
        ? existing.visitHistory
        : [];

    const dates = rawHistory
        .map(item => {
            if (item && typeof item === "object") {
                return parseDate(
                    item.visitedAt ||
                    item.visitTime ||
                    item.date
                );
            }

            return parseDate(item);
        })
        .filter(Boolean);

    if (dates.length > 0) {
        return dates;
    }

    const firstKnownDate = parseDate(
        existing.firstVisit ||
        existing.visitTime ||
        existing.createdAt
    );

    return firstKnownDate ? [firstKnownDate] : [];
}

function readRequestBody(req, res) {
    return new Promise((resolve, reject) => {
        let body = "";
        let tooLarge = false;

        req.on("data", chunk => {
            if (tooLarge) return;

            body += chunk.toString();

            if (Buffer.byteLength(body, "utf8") > 10000) {
                tooLarge = true;

                sendJSON(res, 413, {
                    success: false,
                    message: "Visitor request is too large."
                });

                reject(new Error("Request body too large."));
            }
        });

        req.on("end", () => {
            if (!tooLarge) resolve(body);
        });

        req.on("error", error => {
            if (!tooLarge) reject(error);
        });
    });
}

async function visitorRoute(req, res) {
    const pathname = new URL(
        req.url,
        "http://localhost"
    ).pathname;

    // GET: Fetch visitors for authenticated admins only.
    if (req.method === "GET" && pathname === "/api/visitors") {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            sendJSON(res, 401, {
                success: false,
                message: "Admin authentication required."
            });

            return true;
        }

        try {
            const secret = process.env.JWT_SECRET;

            if (!secret) {
                throw new Error("JWT_SECRET is not configured.");
            }

            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, secret);

            if (decoded.role !== "admin") {
                sendJSON(res, 403, {
                    success: false,
                    message: "Admin access only."
                });

                return true;
            }
        } catch (error) {
            sendJSON(res, 401, {
                success: false,
                message: "Invalid or expired admin token."
            });

            return true;
        }

        try {
            const db = await connectDB();

            const visitors = await db.collection("visitors")
                .find()
                .sort({ lastVisit: -1, visitTime: -1 })
                .toArray();

            sendJSON(res, 200, {
                success: true,
                visitors
            });
        } catch (error) {
            console.error("Fetch Visitors Error:", error);

            sendJSON(res, 500, {
                success: false,
                message: "Server error while fetching visitors."
            });
        }

        return true;
    }

    // POST: Record a first visit or a genuine returning visit.
    if (req.method === "POST" && pathname === "/api/visitors") {
        try {
            const body = await readRequestBody(req, res);

            if (res.writableEnded || res.destroyed) return true;

            if (!body.trim()) {
                sendJSON(res, 400, {
                    success: false,
                    message: "Visitor data is missing."
                });

                return true;
            }

            const visitorData = JSON.parse(body);

            const visitorId =
                typeof visitorData.visitorId === "string"
                    ? visitorData.visitorId.trim()
                    : "";

            const userId = visitorData.userId != null
                ? String(visitorData.userId).trim()
                : "";

            if (!visitorId && !userId) {
                sendJSON(res, 400, {
                    success: false,
                    message: "A visitor ID or user ID is required."
                });

                return true;
            }

            const db = await connectDB();
            const visitors = db.collection("visitors");
            const now = new Date();

            // Registered account identity takes priority.
            const identity = userId
                ? { userId }
                : { visitorId };

            let existing = await visitors.findOne(identity);

            // Link a legacy account record when an email matches.
            if (!existing && userId && visitorData.email) {
                existing = await visitors.findOne({
                    email: visitorData.email
                });

                if (existing) {
                    await visitors.updateOne(
                        { _id: existing._id },
                        { $set: { userId } }
                    );
                }
            }

            // First recorded visit.
            if (!existing) {
                await visitors.insertOne({
                    ...identity,
                    name: visitorData.name || "Guest",
                    email: visitorData.email || "Not provided",
                    visitCount: 1,
                    firstVisit: now,
                    lastVisit: now,
                    visitHistory: [now],
                    createdAt: now
                });

                sendJSON(res, 201, {
                    success: true,
                    returningVisitor: false,
                    visitCount: 1,
                    message: "First visit recorded."
                });

                return true;
            }

            const existingLastVisit = parseDate(
                existing.lastVisit ||
                existing.visitTime ||
                existing.createdAt
            );

            const existingHistory = normalizeHistory(existing);

            const storedCount = Number(existing.visitCount);

            // Don't invent a historical count for legacy records.
            const knownCount = Number.isInteger(storedCount) &&
                storedCount >= 1
                    ? storedCount
                    : null;

            // Avoid counting immediate duplicate requests as visits.
            // A frontend should still send only one visit event
            // for each genuine session.
            const duplicateWindowMs = 30 * 1000;

            if (
                existingLastVisit &&
                now.getTime() - existingLastVisit.getTime() <
                    duplicateWindowMs
            ) {
                const resultCount = knownCount;

                sendJSON(res, 200, {
                    success: true,
                    duplicateEvent: true,
                    returningVisitor: true,
                    visitCount: resultCount,
                    message: "Recent visit already recorded."
                });

                return true;
            }

            // Migrate the existing record while preserving its history.
            const updatedHistory = [...existingHistory, now];

            // If the old record had no reliable count, only the new
            // event is known; don't claim this is its lifetime total.
            const updatedCount = knownCount !== null
                ? knownCount + 1
                : null;

            const updateFields = {
                name: visitorData.name || existing.name || "Guest",
                email: visitorData.email ||
                    existing.email ||
                    "Not provided",
                firstVisit: parseDate(
                    existing.firstVisit ||
                    existingHistory[0] ||
                    existing.createdAt ||
                    existing.visitTime
                ) || now,
                lastVisit: now,
                visitHistory: updatedHistory
            };

            if (updatedCount !== null) {
                updateFields.visitCount = updatedCount;
            }

            await visitors.updateOne(
                { _id: existing._id },
                { $set: updateFields }
            );

            console.log(
                "Visitor activity recorded:",
                userId || visitorId,
                "Count:",
                updatedCount ?? "Unknown historical count"
            );

            sendJSON(res, 200, {
                success: true,
                returningVisitor: true,
                visitCount: updatedCount,
                lastVisit: now,
                message: "Visitor activity recorded."
            });
        } catch (error) {
            if (res.writableEnded || res.destroyed) return true;

            if (error instanceof SyntaxError) {
                sendJSON(res, 400, {
                    success: false,
                    message: "Invalid JSON in visitor request."
                });

                return true;
            }

            if (error.message === "Request body too large.") {
                return true;
            }

            console.error("Visitor Error:", error);

            sendJSON(res, 500, {
                success: false,
                message: "Server error while recording visitor."
            });
        }

        return true;
    }

    return false;
}

module.exports = visitorRoute;