"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/utils/jwt";
import FormInput from "@/app/components/FormInput";
import verticalsData from "@/data/verticals.json"; // Import verticals data
import categoriesData from "@/data/categories.json"; // Import categories data
import "./styles.css";

interface Params {
  id: string;
}

interface ServerSidePropsContext {
  params: Params;
}

interface ServerSideProps {
  props: {
    params: Params;
  };
}

export async function getServerSideProps(
  context: ServerSidePropsContext
): Promise<ServerSideProps> {
  return {
    props: {
      params: context.params,
    },
  };
}

interface OKR {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  category: string;
  keyResults: { id: string; title: string; progress: number }[]; // Added keyResults
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

const EditOKRPage = ({
  params,
  initialData,
  setIsModalOpen,
  setSelectedOKRId,
  onRefresh,
}: {
  params: Params;
  initialData?: OKR;
  setIsModalOpen: (isOpen: boolean) => void;
  setSelectedOKRId: (id: string | null) => void;
  onRefresh: () => void;
}) => {
  const { id } = params;
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [startDate, setStartDate] = useState(
    initialData?.startDate ? formatDate(initialData.startDate) : ""
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate ? formatDate(initialData.endDate) : ""
  );
  const [category, setCategory] = useState(initialData?.category || "");
  const [error, setError] = useState("");
  const [vertical, setVertical] = useState(initialData?.vertical || ""); // Add state for vertical
  const [verticalOptions, setVerticalOptions] = useState<string[]>([]); // Add state for vertical options
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]); // Add state for category options
  const [owners, setOwners] = useState<string[]>(initialData?.owners || []); // Add state for owners
  const [ownerInput, setOwnerInput] = useState(""); // Add state for owner input
  const [userOptions, setUserOptions] = useState<string[]>([]);

  const handleAddOwner = () => {
    if (ownerInput && !owners.includes(ownerInput)) {
      setOwners([...owners, ownerInput]);
      setOwnerInput("");
    }
  };

  const handleRemoveOwner = (owner: string) => {
    setOwners(owners.filter((o) => o !== owner));
  };

  const handleOwnerKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddOwner();
    }
  };

  useEffect(() => {
    setVerticalOptions(verticalsData.verticals); // Set vertical options from the JSON file
    setCategoryOptions(categoriesData.categories); // Set category options from the JSON file
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
          const options = data.map((item) => `${item.fullName} ${item.email}`);
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

  useEffect(() => {
    if (!initialData) {
      const fetchOKR = async () => {
        const token = getToken();
        console.log("Fetching OKR details for ID:", id); // Log the ID being fetched

        try {
          const response = await fetch(`/api/okr/fetch?id=${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const okr = await response.json();
            console.log("Fetched OKR details:", okr);
            setTitle(okr.title);
            setDescription(okr.description);
            setStartDate(formatDate(okr.startDate));
            setEndDate(formatDate(okr.endDate));
            setCategory(okr.category);
            setVertical(okr.vertical);
            setOwners(okr.owners || []);
          } else {
            console.error(
              "Failed to fetch OKR details:",
              await response.text()
            );
            setError("Failed to fetch OKR details. Please try again later.");
          }
        } catch (error) {
          console.error("Error during OKR fetch:", error);
          console.error(
            "Stack trace:",
            error instanceof Error ? error.stack : "No stack trace available"
          );
          setError("An unexpected error occurred while fetching OKR details.");
        }
      };

      if (id) fetchOKR(); // Fetch OKR details if ID is available
    }
  }, [id, initialData]);

  interface ErrorResponse {
    message: string;
  }

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedOKRId(null); // Clear the selected OKR ID
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = getToken();
    setError("");

    // Validation for empty fields
    if (
      !title ||
      !description ||
      !startDate ||
      !endDate ||
      !category ||
      !vertical ||
      owners.length === 0
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

    console.log("Submitting OKR update with the following data:", {
      id,
      title,
      description,
      startDate,
      endDate,
      category,
      vertical,
      owners,
    });

    try {
      const response = await fetch("/api/okr/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
          title,
          description,
          startDate,
          endDate,
          category,
          vertical,
          owners,
        }), // Send key results
      });

      if (response.ok) {
        console.log(
          "OKR updated successfully, closing modal and refreshing dashboard"
        );
        closeModal();
        onRefresh();
        router.push("/dashboard"); // Redirect to the dashboard
      } else {
        const errorData: ErrorResponse = await response.json();
        console.error("Update failed:", errorData);
        setError(errorData.message || "Error updating OKR");
      }
    } catch (error) {
      console.error("Error during update operation:", error);
      console.error(
        "Stack trace:",
        error instanceof Error ? error.stack : "No stack trace available"
      );
      setError("An unexpected error occurred while updating OKR.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="shadow-sm w-full max-w-sm bg-green-50 p-8 rounded-lg border border-black"
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Edit OKR</h1>
          <button onClick={closeModal} className="close-button">
            &times;
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <FormInput
          type="text"
          label="Title"
          value={title}
          onChange={setTitle}
          required
          placeholder="Enter a title"
        />
        <FormInput
          type="text"
          label="Description"
          value={description}
          onChange={setDescription}
          required
          placeholder="Enter a description"
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
                  onClick={() => handleRemoveOwner(owner)}
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
          Update OKR
        </button>
      </form>
    </div>
  );
};

export default EditOKRPage;
