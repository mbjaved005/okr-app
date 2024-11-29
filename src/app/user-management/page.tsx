"use client"
import React, { useEffect, useState } from 'react';
import { getToken } from '@/utils/jwt';

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedInUserRole, setLoggedInUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatedRoles, setUpdatedRoles] = useState<{ [key: string]: string }>({});
  const [bulkUpdate, setBulkUpdate] = useState(false); // State to track if bulk update is needed

  useEffect(() => {
    const fetchUsers = async () => {
      const token = getToken();
      if (!token) {
        console.log('Unauthorized');
        setError('Unauthorized');
        setLoading(false);
        return;
      }
      try {
        console.log('Getting all users');
        const response = await fetch('/api/user/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Response Status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched Users Data:', data);
          setUsers(data);
        } else {
          const errorMessage = await response.text();
          console.error('Failed to fetch users:', errorMessage);
          throw new Error('Failed to fetch users');
        }
        const loggedInUserResponse = await fetch('/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await loggedInUserResponse.json();
        console.log('Fetched User Data after login:', userData);
        setLoggedInUserRole(userData.role);
      } catch (err) {
        console.error('Error fetching users:', err);
        console.error('Stack trace:', err instanceof Error ? err.stack : "No stack trace available");
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  interface User {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  }

  const handleRoleChange = (userId: string, newRole: string) => {
    setUpdatedRoles((prevRoles) => {
      const updated = { ...prevRoles, [userId]: newRole };
      setBulkUpdate(Object.keys(updated).length > 1); // Enable bulk update if more than one role is changed
      return updated;
    });
  };

  const handleBulkUpdate = async () => {
    const token = getToken();
    if (!token) {
      setError('Unauthorized');
      return;
    }
    try {
      const updates = Object.entries(updatedRoles).map(([userId, role]) => ({ userId, role }));
      const response = await fetch('/api/user/bulk-update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        throw new Error('Failed to update roles');
      }
    } catch (err) {
      console.error('Error updating roles:', err);
      console.error('Stack trace:', err instanceof Error ? err.stack : "No stack trace available");
      setError(err.message);
    }
  };

  const handleSingleRoleUpdate = async (userId: string) => {
    const token = getToken();
    if (!token) {
      setError('Unauthorized');
      return;
    }
    try {
      const newRole = updatedRoles[userId];
      const response = await fetch('/api/user/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user: User) => (user._id === userId ? { ...user, role: newRole } : user))
        );
        setUpdatedRoles((prevRoles) => {
          const { [userId]: _, ...rest } = prevRoles;
          return rest;
        });
      } else {
        throw new Error('Failed to update role');
      }
    } catch (err) {
      console.error('Error updating role:', err);
      console.error('Stack trace:', err instanceof Error ? err.stack : "No stack trace available");
      setError(err.message);
    }
  };

  // Filter users based on the search term
  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-col min-h-screen" style={{backgroundColor: '#f0f4f8', marginTop: '40px'}}>
      <input
        type="text"
        placeholder="Search by name, email or role"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border"
      />
      {bulkUpdate && (
        <button onClick={handleBulkUpdate} className="mb-4 p-2 bg-blue-500 text-white">
          Bulk Update Role
        </button>
      )}
      <table>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Name</th>
            <th style={{ textAlign: 'left' }}>Email</th>
            <th style={{ textAlign: 'left' }}>Role</th>
            {loggedInUserRole === "Admin" && <th style={{ textAlign: 'left' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user._id}>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td >
                <select
                  value={updatedRoles[user._id] || user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  disabled={loggedInUserRole !== "Admin"}
                  style={{ textAlign: 'left'}}
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                </select>
              </td>
              {loggedInUserRole === "Admin" && (
                <td>
                  <button
                    onClick={() => handleSingleRoleUpdate(user._id)}
                    disabled={!updatedRoles[user._id] || updatedRoles[user._id] === user.role}
                    style={{
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      color: updatedRoles[user._id] && updatedRoles[user._id] !== user.role ? 'blue' : 'inherit',
                      cursor: updatedRoles[user._id] && updatedRoles[user._id] !== user.role ? 'pointer' : 'default',
                      textDecoration: updatedRoles[user._id] && updatedRoles[user._id] !== user.role ? 'underline' : 'none'
                    }}
                  >
                    Update Role
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementPage;