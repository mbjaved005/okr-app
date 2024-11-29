'use client';

import React, { useEffect, useState } from 'react';
import { getToken } from '@/utils/jwt';

const ProfilePage = () => {
  const [userData, setUserData] = useState({ fullName: '', email: '', role: '', permissions: [] });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('User not authenticated. Please log in.');
      console.error("No token found, user not authenticated.");
      return;
    }

    console.log("Fetching user data with token:", token);
    const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode the JWT token
    const userId = decodedToken.id; // Adjust based on your token structure

    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        console.log("User data fetched successfully:", data);
        setUserData({ 
          fullName: data.fullName || '', 
          email: data.email || '', 
          role: data.role || '', 
          permissions: data.permissions || [] 
        });
      } catch (err) {
        console.error('Error fetching user profile:', err);
        console.error('Stack trace:', err instanceof Error ? err.stack : "No stack trace available");
        setError('Failed to load user profile. Please try again.');
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = getToken();

    // Exclude email from the update request
    const { email, ...updateData } = userData;

    const response = await fetch('/api/user/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (response.ok) {
      setSuccess('Profile updated successfully!');
      setError('');
      window.location.reload(); // Refresh the page after successful update
    } else {
      const errorMessage = await response.text();
      console.error("Failed to update profile:", errorMessage);
      setError('Failed to update profile.');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen" style={{ backgroundColor: '#f0f4f8' }}>
       <div className="modal" style={{
        border: '2px solid black',
        borderRadius: '8px', 
        padding: '20px',
        width: '400px', 
        margin: '100px', 
        backgroundColor: 'white' 
      }}>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <input
            type="text"
            name="fullName"
            value={userData.fullName}
            onChange={handleChange}
            placeholder="fullName"
            required
            className="mb-2 p-2 border"
            style={{
              marginBottom: '10px',
              border: '2px solid black', // Add black border to the input field
              borderRadius: '4px', // Optional: add some rounding to the corners
              padding: '8px' // Add padding for better usability
            }}
          />
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="mb-2 p-2 border"
            style={{
              marginBottom: '10px',
              border: '2px solid black', // Add black border to the input field
              borderRadius: '4px', // Optional: add some rounding to the corners
              padding: '8px', // Add padding for better usability
              backgroundColor: 'lightgray',
              color: 'black'
            }}
            disabled // Make email field non-editable
          />
          <select
            name="role"
            value={userData.role}
            onChange={handleChange}
            className="mb-2 p-2 border"
            style={{
              marginBottom: '10px',
              border: '2px solid black', // Add black border to the input field
              borderRadius: '4px', // Optional: add some rounding to the corners
              padding: '8px' // Add padding for better usability
            }}
          >
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
          <h3>Permissions:</h3>
          <ul>
            {userData.permissions.map((permission, index) => (
              <li key={index}>{permission}</li>
            ))}
          </ul>
          <button type="submit" className="p-2 bg-blue-500 text-white">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;