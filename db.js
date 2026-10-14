const { MongoClient } = require("mongodb");

const uri = "mongodb://127.0.0.1:27017";

const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();

        console.log("MongoDB connected successfully!!");

        return client.db("travelease");
    } catch (error) {
        console.error("MongoDB connection failed : ",error);
        throw error;
    }
}

module.exports = connectDB;