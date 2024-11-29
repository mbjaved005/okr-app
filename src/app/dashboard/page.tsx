'use client'; // Ensure this directive is at the top

import React, { useEffect, useState } from 'react';
import { getToken } from '@/utils/jwt';

const DashboardPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [okrs, setOkrs] = useState([]); // State to hold fetched OKRs

  useEffect(() => {
    const token = getToken();
    if (token) {
      console.log("User is authenticated");
      setIsAuthenticated(true);
      fetchOKRs(token); // Fetch OKRs if authenticated
    } else {
      console.log("User is not authenticated");
      setError('User not authenticated. Please log in.');
    }
  }, []);

  const fetchOKRs = async (token) => {
    try {
      console.log("Fetching OKRs for the dashboard");
      const response = await fetch('/api/okr/fetch', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched OKRs:", data); // Log the fetched OKRs
        setOkrs(data); // Set the fetched OKRs to state
      } else {
        console.error("Failed to fetch OKRs:", await response.text());
      }
    } catch (error) {
      console.error('Error fetching OKRs:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : "No stack trace available");
    }
  };

  if (error) {
    console.error("Error in DashboardPage:", error);
    return <div>{error}</div>;
  }

  return (
    <div style={{padding: '5px', float: 'left', width: '100%' }}>
      {isAuthenticated ? (
        <div className="okr-container">
          {okrs.length > 0 ? (
            <ul className="okr-list">
              {okrs.slice(0, okrs.length ).map((okr) => (
                <li key={okr._id} className="border p-4 mb-2 rounded shadow okr-card">
                  <h2 className="font-bold">{okr.title}</h2>
                  <p>{okr.description}</p>
                  <p>Start Date: {new Date(okr.startDate).toLocaleDateString()}</p>
                  <p>End Date: {new Date(okr.endDate).toLocaleDateString()}</p>
                  <p>Category: {okr.category}</p>
                  <p>Vertical: {okr.vertical}</p>
                  <p>Owners: {okr.owner.map((owner, index) => (
                    <span key={index} className="tag">{owner}</span>
                  ))}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-okrs">No OKRs found.</div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <style jsx>{`
        .okr-container {
          min-height: 650px; /* Adjust this value as needed */
        }
        .okr-list {
          width: 100%;
          float: left;
          text-align: left;
        }
        .tag {
          display: inline-block;
          background-color: #007bff;
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          margin-right: 5px;
          margin-bottom: 5px;
        }
        .okr-card {
          width: 100%;
          background-color: white;
          border: 1px solid black;
          text-align: left;
          float: left;
        }
        .no-okrs {
          text-align: center;
          width: 100%;
          padding: 20px;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;