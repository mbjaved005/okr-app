"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/utils/jwt";
import { getInitials } from "@/utils/helpers";
import DashboardPage from "./dashboard/page";
import ProfileIcon from "@/app/components/ProfileIcon"; // Import the ProfileIcon component
import ResetPasswordPage from "@/app/reset-password/page"; // Import the ResetPasswordPage component
import UserManagementPage from "@/app/user-management/page"; // Import the UserManagementPage component

const HomePage = () => {
  const [fullName, setFullName] = useState(""); // State to hold the fullName
  const [email, setEmail] = useState(""); // State to hold the email
  const initials = getInitials(fullName);
  const pathname = usePathname(); // Get the current pathname

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
          setFullName(data.fullName || "");
          setEmail(data.email || "");
        } else {
          console.error("Failed to fetch user data:", await response.text()); // Log the error message
        }
      } else {
        console.warn("No token found, user not authenticated");
      }
    };
    fetchUserData();
  }, []);

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
      <div id="profile-icon-home" className="absolute top-4 right-4">
        <ProfileIcon
          initials={initials}
          fullName={fullName}
          setFullName={setFullName}
        />
      </div>
      <div className="w-full flex flex-col items-center">
        {pathname === "/dashboard" && <DashboardPage />}
        {pathname === "/reset-password" && (
          <ResetPasswordPage getEmail={email} />
        )}
        {pathname === "/user-management" && <UserManagementPage />}
      </div>
    </div>
  );
};

export default HomePage;
