"use client";
import Modal from "react-modal";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
}
import { useEffect, useState } from "react";
import { getToken } from "@/utils/jwt";
import "./user-management.css"; // Import the CSS file for styling
import { FaTrash } from "react-icons/fa"; // Import the delete icon
import "@/styles/alert.css"; // Import the CSS file for the confirmation modal

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedInUserRole, setLoggedInUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatedRoles, setUpdatedRoles] = useState<{ [key: string]: string }>(
    {}
  );
  const [bulkUpdate, setBulkUpdate] = useState(false); // State to track if bulk update is needed
  // const [showConfirmation, setShowConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = getToken();
      if (!token) {
        console.log("Unauthorized");
        setError("Unauthorized");
        setLoading(false);
        return;
      }
      try {
        console.log("Getting all users");
        const response = await fetch("/api/user/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Response Status:", response.status);
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched Users Data:", data);
          setUsers(data);
        } else {
          const errorMessage = await response.text();
          console.error("Failed to fetch users:", errorMessage);
          throw new Error("Failed to fetch users");
        }
        const loggedInUserResponse = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await loggedInUserResponse.json();
        console.log("Fetched User Data after login:", userData);
        setLoggedInUserRole(userData.role);
      } catch (err) {
        console.error("Error fetching users:", err);
        console.error(
          "Stack trace:",
          err instanceof Error ? err.stack : "No stack trace available"
        );
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = (userId: string, newRole: string) => {
    setUpdatedRoles((prevRoles) => {
      const updated = { ...prevRoles, [userId]: newRole };
      if (updated[userId] === users.find((user) => user._id === userId)?.role) {
        delete updated[userId];
      }
      setBulkUpdate(Object.keys(updated).length > 1);
      return updated;
    });
  };

  const handleBulkUpdate = async () => {
    const token = getToken();
    if (!token) {
      setError("Unauthorized");
      return;
    }
    try {
      const updates = Object.entries(updatedRoles).map(([userId, role]) => ({
        userId,
        role,
      }));
      const response = await fetch("/api/user/bulk-update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ updates }),
      });
      if (response.ok) {
        // Update the users state with new roles
        setUsers((prevUsers) =>
          prevUsers.map((user: User) => {
            const updatedRole = updatedRoles[user._id];
            return updatedRole ? { ...user, role: updatedRole } : user;
          })
        );
        setUpdatedRoles({}); // Reset updated roles
        setBulkUpdate(false); // Hide bulk update button
      } else {
        throw new Error("Failed to update roles");
      }
    } catch (err) {
      console.error("Error updating roles:", err);
      console.error(
        "Stack trace:",
        err instanceof Error ? err.stack : "No stack trace available"
      );
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleSingleRoleUpdate = async (userId: string) => {
    const token = getToken();
    if (!token) {
      setError("Unauthorized");
      return;
    }
    try {
      const newRole = updatedRoles[userId];
      const response = await fetch("/api/user/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user: User) =>
            user._id === userId ? { ...user, role: newRole } : user
          )
        );
        setUpdatedRoles((prevRoles) => {
          const { [userId]: _, ...rest } = prevRoles;
          return rest;
        });
      } else {
        throw new Error("Failed to update role");
      }
    } catch (err) {
      console.error("Error updating role:", err);
      console.error(
        "Stack trace:",
        err instanceof Error ? err.stack : "No stack trace available"
      );
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleDeleteUser = async (userEmail: string) => {
    const token = getToken();
    if (!token) {
      setError("Unauthorized");
      return;
    }
    try {
      const response = await fetch(`/api/user/delete/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: userEmail }),
      });
      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.email !== userEmail)
        );
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      console.error(
        "Stack trace:",
        err instanceof Error ? err.stack : "No stack trace available"
      );
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleDeleteClick = (userEmail: string) => {
    console.log(`Deleting user with email: ${userEmail}`);
    setUserToDelete(userEmail);
    setConfirmationModalOpen(true);
  };

  const confirmDelete = async () => {
    console.log("Confirming deletion of user:", userToDelete);
    if (userToDelete) {
      await handleDeleteUser(userToDelete);
      setConfirmationModalOpen(false);
      setUserToDelete(null);
    }
  };

  const closeConfirmationModal = () => {
    setConfirmationModalOpen(false);
  };

  // Filter users based on the search term
  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-management-page bg-green-100">
      <input
        type="text"
        placeholder="Search by name, email or role"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input w-full"
      />
      {bulkUpdate && (
        <button onClick={handleBulkUpdate} className="bulk-update-button">
          Bulk Update Roles
        </button>
      )}
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            {loggedInUserRole === "Admin" && <th>Actions</th>}
            {loggedInUserRole === "Admin" && <th>Delete</th>}
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user._id}>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={updatedRoles[user._id] || user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  disabled={loggedInUserRole !== "Admin"}
                  className="role-select"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                </select>
              </td>
              {loggedInUserRole === "Admin" && (
                <>
                  <td>
                    <button
                      onClick={() => handleSingleRoleUpdate(user._id)}
                      disabled={
                        !updatedRoles[user._id] ||
                        updatedRoles[user._id] === user.role
                      }
                      className="update-role-button"
                    >
                      Update Role
                    </button>
                  </td>
                  <td>
                    <FaTrash
                      onClick={() => handleDeleteClick(user.email)}
                      className="delete-user-icon"
                      style={{ cursor: "pointer", color: "red" }}
                    />
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        isOpen={confirmationModalOpen}
        onRequestClose={closeConfirmationModal}
        contentLabel="Confirm Deletion"
        className="confirmation-modal"
        ariaHideApp={false}
      >
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete this OKR?</p>
        <button className="confirm-button" onClick={confirmDelete}>
          Yes, delete
        </button>
        <button className="cancel-button" onClick={closeConfirmationModal}>
          Cancel
        </button>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
