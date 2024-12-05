"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getToken } from "@/utils/jwt"; // Import the utility for managing JWT
import { getInitials } from "@/utils/helpers";
import Dashboard from "./dashboard/page"; // Adjust the import based on your project structure
import ProfilePage from "./profile/page"; // Adjust the import based on your project structure
import ResetPasswordPage from "./reset-password/page";
import UserManagementPage from "./user-management/page";
import CreateOKRPage from "./create-okr/page";
import ProfileIcon from "@/app/components/ProfileIcon"; // Import the ProfileIcon component

const HomePage = () => {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const pathname = usePathname();
  const [fullName, setFullName] = useState(""); // State to hold the fullName
  const initials = getInitials(fullName);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = getToken(); // Retrieve the token from local storage
      if (token) {
        console.log("Fetching user data with token:", token); // Log the token being used for the fetch
        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFullName(data.fullName || ""); // Set the fullName state
          setSelectedTab("dashboard"); // Redirect to dashboard upon login
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
    const path = pathname.split("/")[1];
    setSelectedTab(path || "dashboard");
  }, [pathname]);

  useEffect(() => {
    if (selectedTab === "create-okr") {
      window.scrollTo(0, 0);
    }
  }, [selectedTab]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 p-4">
      {" "}
      {/* Set a light green background */}
      <Link href="/dashboard" className="absolute top-4 left-4">
        <img
          src="/emumba-logo.png"
          alt="Emumba"
          className="h-8 cursor-pointer"
        />
      </Link>
      <h1 className="text-4xl font-bold text-green-900 text-center mb-8">
        {" "}
        OKR Application (Beta Version)
      </h1>
      <div className="absolute top-4 right-4">
        {" "}
        {/* Position the ProfileIcon at the top right */}
        <ProfileIcon initials={initials} fullName={fullName} />
      </div>
      <div className="w-full flex justify-end p-1">
        <Link
          href="/create-okr"
          onClick={() => {
            setSelectedTab("create-okr");
          }}
        >
          <button className="bg-blue-500 text-white px-3 py-3 rounded hover:bg-green-700">
            Create OKR
          </button>
        </Link>
      </div>
      <div className="w-full flex flex-col items-center">
        {selectedTab === "dashboard" && <Dashboard />}
        {selectedTab === "create-okr" && <CreateOKRPage />}
        {selectedTab === "profile" && <ProfilePage />}
        {selectedTab === "reset-password" && <ResetPasswordPage />}
        {selectedTab === "user-management" && <UserManagementPage />}
      </div>
    </div>
  );
};

export default HomePage;
