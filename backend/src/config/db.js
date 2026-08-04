import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`\n MongoDB connected! DB HOST: ${connectionInstance.connection.host}`);
        return connectionInstance;
    } catch (error) {
        console.error("MONGODB connection FAILED: ", error);
        process.exit(1);
    }
};
