const connectDB = require("../config/db");
const jwt = require("jsonwebtoken");

async function bookingRoute(req, res) {

    // Verify the logged-in user's token
    function verifyToken() {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error("JWT_SECRET is not configured.");
        }

        try {
            return jwt.verify(token, secret);
        } catch (error) {
            return null;
        }
    }

    // Get bookings of the authenticated user
    if (req.method === "GET" && req.url.startsWith("/api/bookings")) {

        try {
            const authenticatedUser = verifyToken();

            if (!authenticatedUser) {
                res.writeHead(401, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false,
                    message: "Please log in again to view your bookings."
                }));

                return true;
            }

            const db = await connectDB();
            const bookingCollection = db.collection("bookings");

            // Ignore any email supplied in the URL.
            // Use only the email verified from the token.
            const userBookings = await bookingCollection.find({
                email: authenticatedUser.email
            }).toArray();

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: true,
                bookings: userBookings
            }));

        } catch (error) {
            console.error("Fetch Bookings Error:", error);

            res.writeHead(500, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                success: false,
                message: "Server error while fetching bookings."
            }));
        }

        return true;
    }

    // Create a new booking for the authenticated user
    if (req.method === "POST" && req.url === "/api/bookings") {

        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", async () => {

            try {
                const authenticatedUser = verifyToken();

                if (!authenticatedUser) {
                    res.writeHead(401, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: false,
                        message: "Please log in again before booking."
                    }));

                    return;
                }

                const bookingData = JSON.parse(body);

                // Get trusted contact details from the database
                const db = await connectDB();
                const userCollection = db.collection("users");

                const user = await userCollection.findOne({
                    _id: new (require("mongodb").ObjectId)(
                        authenticatedUser.userId
                    ),
                    email: authenticatedUser.email
                });

                if (!user) {
                    res.writeHead(401, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: false,
                        message: "Your account could not be verified. Please log in again."
                    }));

                    return;
                }

                // Check required booking fields
                if (
                    !bookingData.destination ||
                    !bookingData.hotel ||
                    !bookingData.roomType ||
                    !bookingData.roomFacility ||
                    !bookingData.roomView ||
                    !bookingData.date ||
                    !bookingData.travellers ||
                    !bookingData.paymentMethod
                ) {
                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: false,
                        message: "Please fill all required booking fields."
                    }));

                    return;
                }

                // Contact details come from the verified account,
                // never from the submitted booking form.
                const newBooking = {
                    userId: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,

                    destination: bookingData.destination,
                    hotel: bookingData.hotel,
                    roomType: bookingData.roomType,
                    roomFacility: bookingData.roomFacility,
                    roomView: bookingData.roomView,
                    date: bookingData.date,
                    travellers: bookingData.travellers,
                    paymentMethod: bookingData.paymentMethod,

                    specialRequest: Array.isArray(bookingData.specialRequest)
                        ? bookingData.specialRequest
                        : [],

                    otherRequest: bookingData.otherRequest || "",
                    createdAt: new Date()
                };

                const bookingCollection = db.collection("bookings");

                await bookingCollection.insertOne(newBooking);

                console.log(
                    "Booking stored for verified user:",
                    user.email
                );

                res.writeHead(201, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: true,
                    message: "Booking Confirmed Successfully!!!"
                }));

            } catch (error) {
                console.error("Booking Error:", error);

                res.writeHead(500, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false,
                    message: "Server error during booking."
                }));
            }
        });

        return true;
    }

    return false;
}

module.exports = bookingRoute;
