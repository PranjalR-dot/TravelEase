const connectDB = require("../config/db");

function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
    });

    res.end(JSON.stringify(data));
}

async function statisticsRoute(req, res) {
    if (req.method !== "GET" || req.url !== "/api/statistics") {
        return false;
    }

    try {
        const db = await connectDB();

        const visitorCollection = db.collection("visitors");
        const bookingCollection = db.collection("bookings");

        // Calculate total recorded visits.
        const visitorRecords = await visitorCollection
            .find({})
            .project({
                visitCount: 1,
                visitHistory: 1,
                firstVisit: 1,
                visitTime: 1,
                createdAt: 1,
            })
            .toArray();

        let totalVisits = 0;

        for (const visitor of visitorRecords) {
            const count = Number(visitor.visitCount);

            if (Number.isInteger(count) && count >= 1) {
                totalVisits += count;
            } else if (Array.isArray(visitor.visitHistory)) {
                totalVisits += visitor.visitHistory.length;
            } else if (
                visitor.firstVisit ||
                visitor.visitTime ||
                visitor.createdAt
            ) {
                // Legacy record: at least one visit is known.
                totalVisits += 1;
            }
        }

        // Count successfully stored bookings.
        const totalBookings = await bookingCollection.countDocuments({});

        sendJSON(res, 200, {
            success: true,
            totalVisits,
            totalBookings,
        });
    } catch (error) {
        console.error("Statistics API Error:", error);

        sendJSON(res, 500, {
            success: false,
            message: "Unable to fetch website statistics.",
        });
    }

    return true;
}

module.exports = statisticsRoute;