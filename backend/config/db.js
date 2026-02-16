import mongoose from 'mongoose';
import envConfig from './index.js';

const connectDB = async () => {
    try {
        await mongoose.connect(envConfig.MONGO_URI);
            console.log('MongoDB connected');
        }catch (error) {
            console.error('MongoDB connection error:', error);
            process.exit(1);
        }   
};

export default connectDB;