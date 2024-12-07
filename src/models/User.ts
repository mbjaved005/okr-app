import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: "Admin" | "Manager" | "Employee"; // Define the role types
  permissions: string[]; // Add permissions field
}

const UserSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Admin", "Manager", "Employee"],
      default: "Employee",
    }, // Default role is Employee
    permissions: { type: [String], default: [] }, // Add permissions field
    resetToken: { type: String },
    resetTokenExpiration: { type: Date },
  },
  { timestamps: true }
);

// Check if the model already exists before defining it
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
