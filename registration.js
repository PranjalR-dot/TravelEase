const connectDB = require("../config/db");
const bcrypt = require("bcryptjs");

async function registrationRoute(req, res) {

    if(req.method === "POST" && req.url === "/api/register") {
        
        let body = "";

        console.log("Waiting for registration data...")

        req.on("data", (chunk) => {
            console.log("Data chunk received")
            body+=chunk.toString();
        });

        req.on("end", async () => {

            console.log("Request body received : ",body);

            try {
                const userData = JSON.parse(body);
               
                // Check required fields
                if (
                    !userData.name ||
                    !userData.email ||
                    !userData.mobile ||
                    !userData.password
                ) {
                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: false,
                        message: "Please fill all required fields."
                    }));

                    return;
                }

                // Check password confirmantion
                if(userData.password !== userData.confirmPassword) {
                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: false,
                        message: "Passwords do not match."
                    }));

                    return;
                }

                    // Connect to TravelEase database
                    console.log("Connecting to MongoDB...");

                    const db = await connectDB();

                    console.log("MongoDB database obtained...")

                    // Users collections
                    const userCollection = db.collection("users");

                    // Check whether email already exists
                    const existingUser = await userCollection.findOne({
                        email: userData.email
                    });

                    if (existingUser) {

                        res.writeHead(409, {
                            "Content-Type": "application/json"
                        });

                        res.end(JSON.stringify({
                            success: false,
                            message: "Email is already registered."
                        }));

                        return;
                    }

                    // Data to store in MongoDB
                    const hashedPassword = await bcrypt.hash(userData.password, 10);
                    console.log("Original Password : ",userData.password);
                    console.log("Hashed Password : ", hashedPassword);
                    const newUser = {
                        name: userData.name,
                        email: userData.email,
                        mobile: userData.mobile,
                        password: hashedPassword,
                        createdAt: new Date()
                    };

                    // Save user
                    await userCollection.insertOne(newUser);

                    console.log("User registered successfully : ", userData.email);

                    res.writeHead(201, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: true,
                        message: "Registration Successful!!"
                    }));
                
            } catch (error) {

                console.error("Registration Error : ", error);

                res.writeHead(500, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false,
                    message: "Server error during registration."
                }));
            }
    
        });

        return true;
    }

        return false;
}

module.exports = registrationRoute;