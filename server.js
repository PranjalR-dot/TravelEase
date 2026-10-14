const http = require("http");

const registrationRoute = require("./routes/registration");
const loginRoute = require("./routes/login");
const bookingRoute = require("./routes/booking");
const visitorRoute = require("./routes/visitor");
const adminLoginRoute = require("./routes/adminLogin");
const contactRoute = require("./routes/contact");
const statisticsRoute = require("./routes/statistics");

const PORT = 5000;

const server = http.createServer((req, res) => {
    console.log("Request received:", req.method, req.url);

    // CORS
    res.setHeader(
        "Access-Control-Allow-Origin",
        "http://localhost:3000"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, OPTIONS"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );

    // Handle preflight requests
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // Registration
    if (
        req.method === "POST" &&
        req.url === "/api/register"
    ) {
        registrationRoute(req, res);
        return;
    }

    // User login
    if (
        req.method === "POST" &&
        req.url === "/api/login"
    ) {
        loginRoute(req, res);
        return;
    }

    // Admin login
    if (
        req.method === "POST" &&
        req.url === "/api/admin-login"
    ) {
        adminLoginRoute(req, res);
        return;
    }

    // Visitor records
    if (
        req.method === "GET" &&
        req.url === "/api/visitors"
    ) {
        visitorRoute(req, res);
        return;
    }

    if (
        req.method === "POST" &&
        req.url === "/api/visitors"
    ) {
        visitorRoute(req, res);
        return;
    }

    // Website statistics: total visits and total bookings
    if (
        req.method === "GET" &&
        req.url === "/api/statistics"
    ) {
        statisticsRoute(req, res);
        return;
    }

    // Bookings
    if (
        req.method === "GET" &&
        req.url.startsWith("/api/bookings")
    ) {
        bookingRoute(req, res);
        return;
    }

    if (
        req.method === "POST" &&
        req.url === "/api/bookings"
    ) {
        bookingRoute(req, res);
        return;
    }

    // Contact form
    if (
        req.method === "POST" &&
        req.url === "/api/contact"
    ) {
        contactRoute(req, res);
        return;
    }

    // Contact messages
    if (
        req.method === "GET" &&
        req.url === "/api/contact-messages"
    ) {
        contactRoute(req, res);
        return;
    }

    // Mark a contact message as read
    if (
        req.method === "PATCH" &&
        /^\/api\/contact-messages\/[a-f\d]{24}\/read$/i.test(req.url)
    ) {
        contactRoute(req, res);
        return;
    }

    // Default response
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });

    res.end("TravelEase Backend is running successfully");
});

server.listen(PORT, () => {
    console.log(
        `TravelEase Backend running on http://localhost:${PORT}`
    );
});
