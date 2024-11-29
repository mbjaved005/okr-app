"use client";
import { useState } from 'react';

const Register = ({ onSuccess, onToggleAuthMode }: { onSuccess: () => void, onToggleAuthMode: () => void }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee'); // Default role
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!fullName || !email || !password) {
      setError('All fields are required');
      console.error('Validation error: All fields are required');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password, role }), // Include role in the request
      });

      if (response.ok) {
        console.log('Registration successful, switching to login view');
        onSuccess(); // Call the onSuccess function to switch to the login view
      } else {
        const data = await response.json(); // Add this line to parse the error response
        setError(data.message || 'Registration failed'); // Update to display the error message
        console.error('Registration error:', data); // Log the error data
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Unexpected error during registration:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-green-100">
      <div className="absolute top-4 left-4">
        <img src="/emumba-logo.png" alt="Emumba" className="h-8" /> {/* Adjust height to 40px */}
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Create a new account</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
            required
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all">
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
          <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all duration-300">Register</button>
        </form>
        <p className="mt-2 text-sm text-black">
          Already have an account? <button onClick={onToggleAuthMode} className="text-indigo-600 hover:text-indigo-500">Log in</button>
        </p>
      </div>
    </div>
  );
};

export default Register;