'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setToken, getToken } from '@/utils/jwt'; // Import the utility for managing JWT

const LoginPage = ({ onToggleAuthMode }: { onToggleAuthMode: (e: React.MouseEvent) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const router = useRouter();

  useEffect(() => {
    const token = getToken(); // Get the token from local storage
    if (token) {
      setIsLoggedIn(true); // Set login state to true if token exists
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      console.log("User is logged in, redirecting to dashboard");
      router.push('/dashboard'); // Redirect to dashboard instead of profile page
      window.location.href = '/dashboard'; // Force a full page reload
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log("Submitting login form with email:", email);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login response received:", data);

      if (res.ok) {
        // Check if the token is present in the response
        if (data.token) {
          setToken(data.token); // This function should store the token in local storage
          console.log("Token stored in local storage:", data.token); // Log the token for debugging
          console.log("Login successful, setting login state to true");
          setIsLoggedIn(true); // Set login state to true
        } else {
          console.error("Login response did not contain a token:", data);
          setError('Login failed: No token received.');
        }
      } else {
        console.error("Login failed:", data.message);
        setError(data.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : "No stack trace available");
      setError('An error occurred during login.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 p-4">
       <div className="absolute top-4 left-4">
        <img src="/emumba-logo.png" alt="Emumba" className="h-8" /> {/* Adjust height to 40px */}
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Welcome back!</h2>
        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all duration-300"
          >
            Sign in
          </button>

          <div className="text-sm mt-4">
            <span className="text-gray-600">
              Don't have an account?
            </span>
            <button
              onClick={onToggleAuthMode}
              className="ml-2 font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;