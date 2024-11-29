"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/utils/jwt';

const EditOKRPage = ({ params }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const okrId = params.id;

  // Log component initialization
  useEffect(() => {
    console.log("Current task being worked on:", "Develop the ability to edit existing OKRs");
    console.log("Current component:", "EditOKRPage");
    console.log("Props received:", params);
    console.log("Component mounted. Current URL:", window.location.href);
    console.log("Current route parameters:", params);
  }, [params]);

  // Log form value changes
  useEffect(() => {
    console.log("Form values updated:", {
      title,
      description,
      startDate,
      endDate,
      category
    });
  }, [title, description, startDate, endDate, category]);

  useEffect(() => {
    const fetchOKR = async () => {
      const token = getToken();
      console.log("Fetching OKR details - ID:", okrId);
      console.log("Authorization token:", token ? "Present" : "Missing");

      try {
        const response = await fetch(`/api/okr/fetch?id=${okrId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("OKR fetch response status:", response.status);

        if (response.ok) {
          const okr = await response.json();
          console.log("OKR details retrieved successfully:", okr);
          setTitle(okr.title);
          setDescription(okr.description);
          setStartDate(new Date(okr.startDate).toISOString().split('T')[0]);
          setEndDate(new Date(okr.endDate).toISOString().split('T')[0]);
          setCategory(okr.category);
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch OKR details:", errorData);
          setError('Failed to fetch OKR details. Please try again later.');
        }
      } catch (error) {
        console.error("Error during OKR fetch:", error);
        console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace available");
        setError('An unexpected error occurred while fetching OKR details.');
      } finally {
        setIsLoading(false);
        console.log("OKR fetch operation completed");
      }
    };

    fetchOKR();
  }, [okrId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    setError('');

    console.log("Form submission attempted with values:", {
      title,
      description,
      startDate,
      endDate,
      category
    });

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      console.error("Validation failed: End date precedes start date");
      setError('End date cannot be earlier than start date');
      return;
    }

    // Validate required fields
    if (!title.trim() || !description.trim() || !category) {
      console.error("Validation failed: Missing required fields");
      setError('All fields are required');
      return;
    }

    console.log("Submitting OKR update request");

    try {
      const response = await fetch('/api/okr/edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: okrId, title, description, startDate, endDate, category }),
      });

      console.log("Update response status:", response.status);

      if (response.ok) {
        console.log("OKR updated successfully, redirecting to dashboard");
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        console.error("Update failed:", errorData);
        setError(errorData.message || 'Error updating OKR');
      }
    } catch (error) {
      console.error('Error during update operation:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : "No stack trace available");
      setError('An unexpected error occurred while updating OKR.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="text-lg text-indigo-600 font-semibold">Loading OKR details...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">Edit Objective</h1>
        <p className="text-gray-600 mt-2">Update your objective and key results to track progress</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <label className="block text-lg font-semibold text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            required
            minLength={3}
            maxLength={100}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <label className="block text-lg font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            required
            rows={4}
            minLength={10}
            maxLength={500}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <label className="block text-lg font-semibold text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <label className="block text-lg font-semibold text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              required
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <label className="block text-lg font-semibold text-gray-700 mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            required
          >
            <option value="">Select a category</option>
            <option value="Department A">Department A</option>
            <option value="Department B">Department B</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <span>Update OKR</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditOKRPage;