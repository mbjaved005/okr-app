"use client"; // This directive indicates that this is a client component
import { useEffect, useState } from 'react';
import { getToken, setToken } from '@/utils/jwt';
import AuthPage from '@/app/auth/page';
import HomePage from './page';
const path = require('path');
const envPath = path.resolve(__dirname, '../../.env');
require("dotenv").config({ debug: true, path: envPath });

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    console.log("Checking authentication state");
    const token = getToken();
    if (token) {
      console.log("JWT found, user is authenticated");
      setIsLoggedIn(true);
      setIsAuthenticated(true);
    } else {
      console.log("No JWT found, user is not authenticated");
      const newToken = process.env.JWT_SECRET || '';
      setToken(newToken);
      setIsLoggedIn(true);
    }
    console.log("Authentication state updated:", isAuthenticated);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getToken();
        if (token) {
          console.log("Fetching user profile data");
          const response = await fetch('/api/user/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log("User profile data fetched successfully");
            setFullName(data.fullName || '');
          } else {
            console.error("Failed to fetch user profile data:", response.statusText);
          }
        } else {
          console.warn("No token available, skipping user profile fetch");
        }
      } catch (error) {
        console.error("Error fetching user profile data:", error);
        console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace available");
      }
    };

    fetchUserData();
  }, []);

  return isAuthenticated ? (
    <>
      <HomePage />
    </>
  ) : (
    <AuthPage />
  );
};

export default AuthProvider;