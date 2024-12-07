"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken } from "@/utils/jwt";

const ProfilePage = ({
  setIsProfileModalOpen,
  onRefresh,
  setFullName,
}: {
  setIsProfileModalOpen: (isOpen: boolean) => void;
  onRefresh: () => void;
  setFullName: (fullName: string) => void;
}) => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    role: "",
    permissions: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError("User not authenticated. Please log in.");
      console.error("No token found, user not authenticated.");
      return;
    }
    console.log("Fetching user data with token:", token);
    const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode the JWT token
    const userId = decodedToken.id; // Adjust based on your token structure

    const fetchUserProfile = async () => {
      try {
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

    fetchUserProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
    setIsUpdated(true); // Set isUpdated to true when any field is changed
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = getToken();

    // Exclude email from the update request
    const { email, ...updateData } = userData;

    const response = await fetch("/api/user/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (response.ok) {
      setSuccess("Profile updated successfully!");
      setError("");
      setIsProfileModalOpen(false); // Close the modal
      onRefresh();
      router.push("/dashboard");
      // window.location.reload();
    } else {
      const errorMessage = await response.text();
      console.error("Failed to update profile:", errorMessage);
      setError("Failed to update profile.");
    }
  };

  const closeModal = () => {
    setIsProfileModalOpen(false); // Close the modal
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="shadow-sm w-full max-w-sm bg-green-50 p-8 rounded-lg border border-black"
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Update Profile</h1>
          <button onClick={closeModal} className="close-button">
            &times;
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <input
          type="text"
          name="fullName"
          value={userData.fullName}
          onChange={handleChange}
          placeholder="fullName"
          required
          className="w-full mb-2 p-2 border"
          style={{
            marginBottom: "10px",
            border: "2px solid black", // Add black border to the input field
            borderRadius: "4px", // Optional: add some rounding to the corners
            padding: "8px", // Add padding for better usability
          }}
        />
        <input
          type="email"
          name="email"
          value={userData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="w-full mb-2 p-2 border"
          style={{
            marginBottom: "10px",
            border: "2px solid black", // Add black border to the input field
            borderRadius: "4px", // Optional: add some rounding to the corners
            padding: "8px", // Add padding for better usability
            backgroundColor: "lightgray",
            color: "black",
          }}
          disabled // Make email field non-editable
        />
        <select
          name="role"
          value={userData.role}
          onChange={handleChange}
          className="w-full mb-2 p-2 border"
          style={{
            marginBottom: "10px",
            border: "2px solid black", // Add black border to the input field
            borderRadius: "4px", // Optional: add some rounding to the corners
            padding: "8px", // Add padding for better usability
          }}
        >
          <option value="Employee">Employee</option>
          <option value="Manager">Manager</option>
          <option value="Admin">Admin</option>
        </select>
        <div className="flex justify-center">
          <button
            type="submit"
            className={`w-full py-2 text-white rounded ${
              isUpdated
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!isUpdated}
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
