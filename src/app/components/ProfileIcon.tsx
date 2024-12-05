import React, { useState, useEffect, useRef } from "react";
import { FaUser, FaUsers, FaLock, FaSignOutAlt } from "react-icons/fa"; // Import icons
import Link from "next/link";
import { removeToken } from "@/utils/jwt"; // Import the utility for managing JWT
const ProfileIcon = ({ initials, fullName }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    // Clear the token and redirect to login page
    removeToken(); // Implement this function in your jwt utility
    window.location.href = "/"; // Redirect to the login page
  };

  return (
    <div className="relative" ref={menuRef}>
      <div
        className="bg-blue-500 text-white rounded-full h-14 w-14 flex items-center justify-center cursor-pointer shadow-md"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{ fontFamily: "Roboto, sans-serif", fontWeight: "bold" }}
      >
        {initials}
      </div>
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-50 bg-[#E6F7E6] border border-gray-400 rounded shadow-lg">
          <div className="p-3 border-b text-center font-bold text-lg">
            Welcome {fullName}
          </div>
          <Link
            href="/profile"
            className="flex items-center px-4 py-2 hover:bg-gray-200"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaUser className="mr-2" /> Profile Management
          </Link>
          <Link
            href="/user-management"
            className="flex items-center px-4 py-2 hover:bg-gray-200"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaUsers className="mr-2" /> User Management
          </Link>
          <Link
            href="/reset-password"
            className="flex items-center px-4 py-2 hover:bg-gray-200"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaLock className="mr-2" /> Reset Password
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 hover:bg-gray-200 w-full text-left"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileIcon;
