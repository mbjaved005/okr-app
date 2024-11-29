import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { testConnection } from './testConnection';

dotenv.config();

const seedRoles = async () => {
  await testConnection(); // Ensure the database connection is established

  const roles = ['Admin', 'Manager', 'Employee'];

  for (const role of roles) {
    const existingRole = await User.findOne({ role });
    if (!existingRole) {
      const user = new User({
        fullName: `${role.toLowerCase()}User`,
        email: `${role.toLowerCase()}@example.com`,
        password: 'password123', // Use a default password for seeding
        role,
      });
      await user.save();
      console.log(`Seeded user with role: ${role}`);
    } else {
      console.log(`User with role ${role} already exists.`);
    }
  }

  mongoose.connection.close();
};

seedRoles().catch(err => {
  console.error('Error seeding roles:', err);
  console.error('Stack trace:', err instanceof Error ? err.stack : 'No stack trace available'); // Log the stack trace for better debugging
  mongoose.connection.close();
});