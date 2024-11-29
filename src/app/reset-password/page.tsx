"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setIsResetMode(true);
    }
  }, []);

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Password recovery email sent successfully.');
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error during password recovery:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : "No stack trace available");
      setMessage('An error occurred while sending the password recovery email.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, oldPassword, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        // Remove token from local storage
        localStorage.removeItem('token'); // Assuming the token is stored under this key
        setMessage('Password reset successful. Redirecting to login...');
        // Refresh the page to redirect to login
        window.location.reload(); // Alternatively, you can use router.push('/login') if you want to avoid a full page reload
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : "No stack trace available");
      setMessage('Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#f0f4f8' }} >
      <div className="modal" style={{
        border: '2px solid black', // Add a black border
        borderRadius: '8px', // Optional: add some rounding to the corners
        padding: '10px', // Optional: add padding for spacing
        width: '400px', // Optional: set a width for the modal
        margin: '100px', // Center the modal
        backgroundColor: 'white' // Ensure the background is white for contrast
      }}>
        <h2 className="text-2xl font-bold text-center">
          {isResetMode ? 'Reset Password' : 'Password Recovery'}
        </h2>
        {isResetMode ? (
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="oldPassword" className="text-sm font-medium text-gray-700">Old Password</label>
              <input
                type="password"
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
            <form onSubmit={handlePasswordRecovery} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Recovery Email'}
            </button>
          </form>
        )}
        {message && <p className={`mt-3 text-sm text-center ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
      </div>
    </div>
  );
};

export default ResetPasswordPage;