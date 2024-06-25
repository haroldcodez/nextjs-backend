import exp from "constants";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
    const connectionState = mongoose.connection.readyState;

    if (connectionState === 1) {
        console.log("Already connected to MongoDB");
        return;
    }

    if (connectionState === 2) {
        console.log("Connecting to MongoDB...");
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI!, {
            dbName: "next14restapi",
            bufferCommands: true
        });
        console.log("Connected to MongoDB");
    } catch (err: any) {
        console.log("Error connecting to MongoDB:", err);
        throw new Error("Error:", err);
    }

};

export default connect; 