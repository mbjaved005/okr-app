"use client"; // Ensure this directive is at the top

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Dashboard from './dashboard/page'; // Adjust the import based on your project structure
import ProfilePage from './profile/page'; // Adjust the import based on your project structure
import ResetPasswordPage from './reset-password/page';
import { getToken } from '@/utils/jwt'; // Import the utility for managing JWT
import Navbar from '@/app/components/Navbar'; // Import the Navbar component
import UserManagementPage from './user-management/page';
import CreateOKRPage from './create-okr/page';
import Link from 'next/link'; // Import Link for navigation

const HomePage = () => {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const pathname = usePathname();
  const [fullName, setFullName] = useState(''); // State to hold the fullName

  useEffect(() => {
    const fetchUserData = async () => {
      const token = getToken(); // Retrieve the token from local storage
      if (token) {
        console.log("Fetching user data with token:", token); // Log the token being used for the fetch
        const response = await fetch('/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log("User data fetched successfully:", data); // Log the fetched user data
          console.log("fullName:", data.fullName); // Log the fullName
          setFullName(data.fullName || ''); // Set the fullName state
          setSelectedTab('dashboard'); // Redirect to dashboard upon login
        } else {
          console.error("Failed to fetch user data:", await response.text()); // Log the error message
        }
      } else {
        console.warn("No token found, user not authenticated");
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const path = pathname.split('/')[1];
    setSelectedTab(path || 'dashboard');
  }, [pathname]);

  useEffect(() => {
    if (selectedTab === 'create-okr') {
      window.scrollTo(0, 0);
    }
  }, [selectedTab]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 p-4"> {/* Set a light green background */}
      <Link href="/dashboard" className="absolute top-4 left-4">
        <img src="/emumba-logo.png" alt="Emumba" className="h-8 cursor-pointer" />
      </Link>
      <h1 className="text-4xl font-bold text-green-900 text-center mb-8">Welcome {fullName}!</h1>
      <Navbar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      <div className="w-full flex justify-end p-4">
        <Link href="/create-okr">
          <button className="bg-blue-700 text-white px-2 py-2 rounded hover:bg-green-700">
            Create OKR
          </button>
        </Link>
      </div>
      {/* Render the content based on the selected tab */}
      {selectedTab === 'dashboard' && <Dashboard />}
      {selectedTab === 'create-okr' && <CreateOKRPage />}
      {selectedTab === 'profile' && <ProfilePage />}
      {selectedTab === 'reset-password' && <ResetPasswordPage />}
      {selectedTab === 'user-management' && <UserManagementPage />}
    </div>
  );
};

export default HomePage;