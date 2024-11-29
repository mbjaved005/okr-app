import jwt from 'jsonwebtoken';
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ debug: true, path: envPath });

export const getToken = (): string | null => {
  if (typeof localStorage === 'undefined') {
    console.warn("localStorage is not available");
    return null;
  }
  console.log("Retrieving token from local storage");
  return localStorage.getItem('token'); // Use localStorage instead
};

export const setToken = (token: string) => {
  if (typeof localStorage === 'undefined') {
    console.warn("localStorage is not available");
    return;
  }
  console.log("Setting token in local storage:", token); // Log the token being set
  localStorage.setItem('token', token); // Use localStorage instead
};

export const removeToken = () => {
  if (typeof localStorage === 'undefined') {
    console.warn("localStorage is not available");
    return;
  }
  console.log("Removing token from local storage");
  localStorage.removeItem('token'); // Use localStorage instead
};

export const verifyToken = (token: string) => {
  if (!token) {
    console.warn("No token provided for verification");
    return null; // If no token is provided, return null
  }

  try {
    const secret = process.env.JWT_SECRET; // INPUT_REQUIRED {JWT secret for token verification}
    if (!secret) {
      throw new Error("JWT_SECRET is not defined"); // Ensure JWT_SECRET is defined
    }
    const decoded = jwt.verify(token, secret);
    console.log("Token verified successfully:", decoded);
    return decoded; // Return the decoded token if verification is successful
  } catch (error) {
    console.error("Token verification failed:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace available");
    return null;
  }
};