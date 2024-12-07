import Link from "next/link";
import Modal from "react-modal";
import { useRouter } from "next/navigation"; // Import the useRouter hook
import { useState, useEffect, useRef } from "react";
import { FaUser, FaUsers, FaLock, FaSignOutAlt } from "react-icons/fa";
import { removeToken, getToken } from "@/utils/jwt";
import ProfilePage from "@/app/profile/page";
import "@/styles/modal.css"; // Import the new CSS file for modal styles

const ProfileIcon = ({
  initials,
  fullName,
  setFullName,
}: {
  initials: string;
  fullName: string;
  setFullName: (fullName: string) => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // State to manage profile modal visibility
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    role: "",
    permissions: [],
  });
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef(null);
  const router = useRouter(); // Initialize router for navigation

  interface UserData {
    fullName: string;
    email: string;
    role: string;
    permissions: string[];
  }

  interface ProfileIconProps {
    initials: string;
    fullName: string;
    setFullName: (fullName: string) => void;
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !(menuRef.current as HTMLElement).contains(event.target as Node)) {
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
    removeToken();
    window.location.href = "/";
  };

  const fetchUserProfile = async () => {
    try {
      const token = getToken();
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      setUserData({
        fullName: data.fullName || "",
        email: data.email || "",
        role: data.role || "",
        permissions: data.permissions || [],
      });
      setFullName(data.fullName);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      console.error(
        "Stack trace:",
        err instanceof Error ? err.stack : "No stack trace available"
      );
      setError("Failed to load user profile. Please try again.");
    }
  };

  const handleResetPassword = () => {
    router.push("/reset-password"); // Navigate to the reset password page
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
          <button
            className="flex items-center px-4 py-2 hover:bg-gray-200 w-full text-left"
            onClick={() => {
              setIsMenuOpen(false);
              setIsProfileModalOpen(true);
            }}
          >
            <FaUser className="mr-2" /> Profile Management
          </button>
          <Link
            href="/user-management"
            className="flex items-center px-4 py-2 hover:bg-gray-200"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaUsers className="mr-2" /> User Management
          </Link>
          <button
            className="flex items-center px-4 py-2 hover:bg-gray-200 w-full text-left"
            onClick={handleResetPassword}
          >
            <FaLock className="mr-2" /> Reset Password
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 hover:bg-gray-200 w-full text-left"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </div>
      )}
      <Modal
        isOpen={isProfileModalOpen}
        onRequestClose={() => setIsProfileModalOpen(false)}
        contentLabel="Profile Management"
        ariaHideApp={false}
        className="modal"
      >
        <ProfilePage
          setIsProfileModalOpen={setIsProfileModalOpen}
          onRefresh={fetchUserProfile}
          setFullName={setFullName}
        />
      </Modal>
    </div>
  );
};

export default ProfileIcon;
