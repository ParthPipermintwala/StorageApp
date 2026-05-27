import mongoose from "mongoose";

export async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1); // Exit the process with an error code
    }
}

// Handle graceful shutdown when the application is terminated (Ctrl+C)
process.on("SIGINT", async () => {
    await mongoose.disconnect();
    console.log("MongoDB connection closed");
    process.exit(0); 
});
