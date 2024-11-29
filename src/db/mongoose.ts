import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ debug: true, path: envPath });


const mongoURI = process.env.MONGODB_URI; // INPUT_REQUIRED {MongoDB connection string}
const jwtSecret = process.env.JWT_SECRET; // JWT secret

mongoose.connect(mongoURI as string)
  .then((): void => {
    console.log('MongoDB connection successful');
    if (process.env.NODE_ENV !== 'production') {
      console.log('JWT Secret:', jwtSecret); // Log JWT secret for testing (do not expose in production)
    }
  })
  .catch((error: Error): void => {
    console.error('MongoDB connection error:', error.message || error);
    console.error('Stack trace:', error.stack); // Log the stack trace for better debugging
    process.exit(1); // Exit process with failure
  });

// Exporting mongoose for use in other parts of the application
export default mongoose;