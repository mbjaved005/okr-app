import mongoose from 'mongoose';

export const testConnection = async () => {
  try {
    await mongoose.connection.readyState;
    console.log('MongoDB connection is active');
  } catch (error) {
    console.error('Error testing MongoDB connection:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
};

testConnection();