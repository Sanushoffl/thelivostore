import mongoose from "mongoose";

const connectDB = async () => {
    // Validate MONGODB_URI environment variable
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set. Please add it to your .env file.');
    }

    // Validate connection string format
    const mongoUri = process.env.MONGODB_URI.trim();
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
        throw new Error('Invalid MONGODB_URI format. It must start with "mongodb://" or "mongodb+srv://"');
    }

    mongoose.connection.on('connected',() => {
        console.log("DB Connected");
    })

    try {
        await mongoose.connect(`${mongoUri}/e-commerce`);
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw error;
    }
}

export default connectDB;