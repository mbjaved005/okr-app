"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/utils/jwt";
import FormInput from "@/app/components/FormInput";
import verticalsData from "@/data/verticals.json"; // Import verticals data
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

  useEffect(() => {
    setVerticalOptions(verticalsData.verticals); // Set vertical options from the JSON file
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
    console.log("Submitting OKR update with the following data:", {
      id,
      title,
      description,
      startDate,
      endDate,
      category,
      vertical, // Log the vertical being submitted
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
        }),
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
        className="shadow-sm w-full max-w-sm bg-white p-8 rounded-lg border border-black"
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
          options={["Department A", "Department B"]}
        />
        <FormInput
          type="select"
          label="Vertical"
          value={vertical}
          onChange={setVertical}
          required
          options={verticalOptions}
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Update OKR
        </button>
      </form>
    </div>
  );
};

export default EditOKRPage;
