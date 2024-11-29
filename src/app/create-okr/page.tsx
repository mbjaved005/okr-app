"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/utils/jwt';
import './CreateOKRPage.css';
import verticalsData from '@/data/verticals.json';
import { WithContext as ReactTags } from 'react-tag-input';
import {getUserFullName} from '@/utils/auth';
const CreateOKRPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [owners, setOwners] = useState<Tag[]>([]);
  const [vertical, setVertical] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const verticalOptions = verticalsData.verticals;

  useEffect(() => {
    console.log("CreateOKRPage component mounted");
    const fetchFullName = async () => {
      const fullName = await getUserFullName();
      setOwners([{ id: 'default-owner', text: fullName }]); // Set the user's full name as the default owner
    };
    fetchFullName();
  }, []);

  interface Tag {
    id: string;
    text: string;
  }

  const handleDelete = (i: number): void => {
    const newOwners = owners.slice(0);
    newOwners.splice(i, 1);
    setOwners(newOwners);
  };

  const handleAddition = (tag: Tag) => {
    setOwners([...owners, tag]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit called");
    if (!title || !description || !startDate || !endDate || !category || owners.length === 0 || !vertical) {
      setError('All fields are required');
      return;
    }
    const token = getToken();
    console.log("Submitting OKR with values:", { title, description, startDate, endDate, category, owners, vertical });
    try {
      const response = await fetch('/api/okr/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, startDate, endDate, category, owners: owners.map(owner => owner.text), vertical }),
      });

      console.log("Response from OKR creation API:", response);

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(data.message || 'Error creating OKR');
      }
    } catch (error) {
      console.error('Error during OKR creation:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : "No stack trace available");
      setError('An unexpected error occurred while creating OKR.');
    }
  };

  return (
    <div className="flex flex-col container min-h-screen" style={{ backgroundColor: '#f0f4f8', marginTop:"20px"}}>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
            <label htmlFor="title" className="form-label">
              Title<span style={{ color: 'red' }}> *</span>
            </label>
          <input type="text" className="form-control styled-input" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label" style={{ marginTop: '10px' }}>Description<span style={{ color: 'red' }}> *</span></label>
          <textarea className="form-control styled-input" id="description" value={description} onChange={(e) => setDescription(e.target.value)} required/>
        </div>
        <div className="mb-3">
          <label htmlFor="startDate" className="form-label">Start Date<span style={{ color: 'red' }}> *</span></label>
          <input type="date" className="form-control styled-input" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label htmlFor="endDate" className="form-label">End Date<span style={{ color: 'red' }}> *</span></label>
          <input type="date" className="form-control styled-input" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label htmlFor="category" className="form-label">Category<span style={{ color: 'red' }}> *</span></label>
          <select className="form-select styled-input" id="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">Select a category</option>
            <option value="Department A">Department A</option>
            <option value="Department B">Department B</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="owners" className="form-label">Owners<span style={{ color: 'red' }}> *</span></label>
          <ReactTags
            tags={owners}
            handleDelete={handleDelete}
            handleAddition={handleAddition}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="vertical" className="form-label">Vertical<span style={{ color: 'red' }}> *</span></label>
          <select className="form-select styled-input" id="vertical" value={vertical} onChange={(e) => setVertical(e.target.value)} required>
            <option value="">Select a vertical</option>
            {verticalOptions.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <style jsx>{`
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
          }
          .form-label {
            font-weight: bold;
            color: #555;
          }
          .styled-input {
            width: 100%;
            padding: 10px;
            margin-top: 5px;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
          .styled-input:focus {
            border-color: #007bff;
            box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
          }
          .styled-button {
            width: 10%;
            padding: 6px;
            background-color: #007bff;
            border: none;
            border-radius: 4px;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s;
          }
          .styled-button:hover {
            background-color: #0056b3;
          }
          .alert-danger {
            color: #721c24;
            background-color: #f8d7da;
            border-color: #f5c6cb;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
          }
          .ReactTags__tag {
            background: #007bff;
            color: white;
            border-radius: 20px;
            padding: 5px 10px;
            margin-right: 5px;
            margin-bottom: 5px;
          }
          .ReactTags__tagInput {
            width: 100%;
          }
        `}</style>
        <button type="submit" className="btn btn-primary styled-button">Submit OKR</button>
      </form>
    </div>
  );
};

export default CreateOKRPage;