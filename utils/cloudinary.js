import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Add a test function
export const testConnection = async () => {
    try {
        const result = await cloudinary.api.ping();
        console.log('Cloudinary connection successful:', result);
        return result;
    } catch (error) {
        console.error('Cloudinary connection failed:', error);
        throw error;
    }
};

export default cloudinary;