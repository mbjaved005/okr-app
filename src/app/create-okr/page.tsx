"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/utils/jwt";
import { getUserFullName } from "@/utils/auth";
import verticalsData from "@/data/verticals.json";
import categoriesData from "@/data/categories.json"; // Import categories data
import FormInput from "@/app/components/FormInput";

const CreateOKRPage = ({
  setIsModalOpen,
  onRefresh,
  category: defaultCategory,
}: {
  setIsModalOpen: (isOpen: boolean) => void;
  onRefresh: () => void;
  category: string;
}) => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState(defaultCategory); // Set default category
  const [owners, setOwners] = useState<string[]>([]);
  const [vertical, setVertical] = useState("");
  const [error, setError] = useState("");
  const [ownerInput, setOwnerInput] = useState("");
  const [userOptions, setUserOptions] = useState<string[]>([]);

  const verticalOptions = verticalsData.verticals;
  const categoryOptions = categoriesData.categories; // Get category options from JSON

  useEffect(() => {
    console.log("CreateOKRPage component mounted");
    const fetchFullName = async () => {
      const selectedOwner = await getUserFullName();
      setOwners([selectedOwner]);
    };
    fetchFullName();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = getToken();
      if (!token) {
        console.log("Unauthorized");
        setError("Unauthorized");
        return;
      }
      try {
        console.log("Getting all users");
        const response = await fetch("/api/user/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched Users Data:", data);
          const options = data.map(
            (item: any) => `${item.fullName} ${item.email}`
          );
          setUserOptions(options);
          console.log("Fetched  Users for owners ", options);
        } else {
          const errorMessage = await response.text();
          console.error("Failed to fetch users:", errorMessage);
          throw new Error("Failed to fetch users");
        }
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
      }
    };

    fetchUsers();
  }, []);

  interface Tag {
    id: string;
    text: string;
  }

  const handleDelete = (owner: string): void => {
    setOwners(owners.filter((o) => o !== owner));
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit called");

    // Validation for empty fields
    if (
      !title ||
      !description ||
      !startDate ||
      !endDate ||
      !category ||
      owners.length === 0 ||
      !vertical
    ) {
      setError("All fields are required");
      return;
    }

    // Validation for date logic
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      setError("End date must be after start date");
      return;
    }

    const token = getToken();
    console.log("Submitting OKR with values:", {
      title,
      description,
      startDate,
      endDate,
      category,
      owners,
      vertical,
    });
    try {
      const response = await fetch("/api/okr/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          startDate,
          endDate,
          category,
          owners: owners,
          vertical,
        }),
      });

      console.log("Response from OKR creation API:", response);

      if (response.ok) {
        console.log(
          "OKR created successfully, closing modal and refreshing dashboard"
        );
        closeModal();
        onRefresh();
        router.push("/dashboard");
      } else {
        const data = await response.json();
        setError(data.message || "Error creating OKR");
      }
    } catch (error) {
      console.error("Error during OKR creation:", error);
      console.error(
        "Stack trace:",
        error instanceof Error ? error.stack : "No stack trace available"
      );
      setError("An unexpected error occurred while creating OKR.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="shadow-sm w-full max-w-sm bg-green-50 p-8 rounded-lg border border-black"
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Create OKR</h1>
          <button onClick={closeModal} className="close-button">
            &times;
          </button>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <FormInput
          type="text"
          label="Title"
          value={title}
          onChange={setTitle}
          required
        />
        <FormInput
          type="textarea"
          label="Description"
          value={description}
          onChange={setDescription}
          required
        />
        <FormInput
          type="date"
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
          required
        />
        <FormInput
          type="date"
          label="End Date"
          value={endDate}
          onChange={setEndDate}
          required
        />
        <FormInput
          type="select"
          label="Category"
          value={category}
          onChange={setCategory}
          required
          options={categoryOptions}
        />
        <FormInput
          type="select"
          label="Vertical"
          value={vertical}
          onChange={setVertical}
          required
          options={verticalOptions}
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owners <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center mb-2">
            <select
              value={ownerInput}
              onChange={(e) => {
                const selectedOwner = e.target.value;
                if (selectedOwner && !owners.includes(selectedOwner)) {
                  setOwners([...owners, selectedOwner]);
                  setOwnerInput("");
                }
              }}
              className="shadow w-full px-4 py-2 border rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-200 border-gray-300"
            >
              <option value="" disabled>
                Select an owner
              </option>
              {userOptions
                .filter((option) => !owners.includes(option))
                .map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex flex-wrap">
            {owners.map((owner) => (
              <span
                key={owner}
                className="bg-gray-200 text-gray-700 py-1 px-3 rounded-full mr-2 mb-2 flex items-center"
              >
                {owner.split(" ").slice(0, -1).join(" ")}
                <button
                  type="button"
                  onClick={() => handleDelete(owner)}
                  className="ml-2 text-red-500"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className={`w-full py-2 text-white rounded ${
            owners.length > 0
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={owners.length === 0}
        >
          Submit OKR
        </button>
      </form>
    </div>
  );
};

export default CreateOKRPage;
