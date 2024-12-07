"use client"; // Ensure this directive is at the top
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa"; // Import delete icon
import Modal from "react-modal";
import { getToken } from "@/utils/jwt";
import EditOKRPage from "@/app/edit-okr/[id]";
import CreateOKRPage from "@/app/create-okr/page"; // Import the CreateOKRPage component
import "@/styles/alert.css"; // Import the new CSS file for modal styles
import "@/styles/dashboard.css"; // Import the new CSS file for dashboard styles
import "@/styles/modal.css"; // Import the new CSS file for modal styles

const DashboardPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOKRId, setSelectedOKRId] = useState<string | null>(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [okrToDelete, setOkrToDelete] = useState<string | null>(null);
  const [okrs, setOkrs] = useState<OKR[]>([]); // State to hold fetched OKRs
  const [fullName, setFullName] = useState(""); // State to hold the fullName

  interface OKR {
    _id: string;
    title: string;
    endDate: string;
    category: string;
    vertical: string;
    owners: string[];
    description: string;
    startDate: string;
    keyResults: { id: string; title: string; progress: number }[];
  }

  useEffect(() => {
    const token = getToken();
    if (token) {
      console.log("User is authenticated");
      setIsAuthenticated(true);
      fetchOKRs(); // Fetch OKRs if authenticated
    } else {
      console.log("User is not authenticated");
      setError("User not authenticated. Please log in.");
    }
  }, []);

  const fetchOKRs = async (): Promise<void> => {
    try {
      const token = getToken();
      console.log("Fetching OKRs for the dashboard");
      const response = await fetch("/api/okr/fetch", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data: OKR[] = await response.json();
        console.log("Fetched OKRs:", data);
        setOkrs(data); // Set the fetched OKRs to state
      } else {
        console.error("Failed to fetch OKRs:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching OKRs:", error);
      console.error(
        "Stack trace:",
        error instanceof Error ? error.stack : "No stack trace available"
      );
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = getToken(); // Retrieve the token from local storage
      if (token) {
        console.log("Fetching user data with token:", token); // Log the token being used for the fetch
        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFullName(data.fullName || "");
        } else {
          console.error("Failed to fetch user data:", await response.text()); // Log the error message
        }
      } else {
        console.warn("No token found, user not authenticated");
      }
    };
    fetchUserData();
  }, []);

  const openModal = (id: string) => {
    const selectedOKR = okrs.find((okr) => okr._id === id);
    if (selectedOKR) {
      console.log("Opening modal for OKR ID:", id); // Log when the modal is opened
      setSelectedOKRId(id);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    console.log("Closing modal"); // Log when the modal is closed
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setSelectedOKRId(null);
    setIsModalOpen(true);
  };

  const openConfirmationModal = (id: string) => {
    setOkrToDelete(id);
    setConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setConfirmationModalOpen(false);
    setOkrToDelete(null);
  };

  const handleDeleteOKR = async () => {
    const token = getToken();
    if (!token || !okrToDelete) return;

    try {
      const response = await fetch("/api/okr/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: okrToDelete }),
      });

      if (response.ok) {
        setOkrs((prevOkrs) =>
          prevOkrs.filter((okr) => okr._id !== okrToDelete)
        );
        closeConfirmationModal();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error deleting OKR");
      }
    } catch (error) {
      console.error("Error during OKR deletion:", error);
      console.error(
        "Stack trace:",
        error instanceof Error ? error.stack : "No stack trace available"
      );
      setError("An unexpected error occurred while deleting OKR.");
    }
  };

  if (error) {
    console.error("Error in DashboardPage:", error);
    return <div>{error}</div>;
  }

  return (
    <div style={{ padding: "5px", float: "left", width: "100%" }}>
      {isAuthenticated ? (
        <div className="okr-container">
          <button
            onClick={openCreateModal}
            className="create-okr-btn primary-btn bg-blue-500"
            style={{
              float: "right",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
              marginBottom: "20px",
            }}
          >
            Create OKR
          </button>
          {okrs.length > 0 ? (
            <ul className="okr-list">
              {okrs.map((okr) => (
                <li
                  key={okr._id}
                  className="border p-4 mb-2 rounded shadow okr-card"
                >
                  <div className="okr-header">
                    <h2 className="font-bold inline-block">{okr.title}</h2>
                    <button
                      onClick={() => openModal(okr._id)}
                      className="text-blue-500 hover:underline ml-2"
                    >
                      <FaEdit className="inline-block" /> Edit
                    </button>
                    <button
                      onClick={() => openConfirmationModal(okr._id)}
                      className="text-red-500 hover:underline ml-2"
                    >
                      <FaTrash className="inline-block" /> Delete
                    </button>
                  </div>
                  <div className="okr-details">
                    <p>
                      <strong style={{ fontSize: "18px" }}>End Date:</strong>{" "}
                      <span style={{ fontSize: "18px" }}>
                        {new Date(okr.endDate).toLocaleDateString()}
                      </span>
                    </p>
                    <p>
                      <strong style={{ fontSize: "18px" }}>Category:</strong>{" "}
                      <span style={{ fontSize: "18px" }}>{okr.category}</span>
                    </p>
                    <p>
                      <strong style={{ fontSize: "18px" }}>Vertical:</strong>{" "}
                      <span style={{ fontSize: "18px" }}>{okr.vertical}</span>
                    </p>
                  </div>
                  <div className="okr-owners">
                    <p>
                      <strong style={{ fontSize: "18px" }}>Owners:</strong>{" "}
                      <span style={{ fontSize: "18px" }}>
                        {okr.owners.map((owner, index) => (
                          <span
                            key={index}
                            className="tag"
                            style={{ fontSize: "16px" }}
                          >
                            {owner}
                          </span>
                        ))}
                      </span>
                    </p>
                  </div>
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
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Create/Edit OKR"
        ariaHideApp={false}
        className="modal"
      >
        {selectedOKRId ? (
          <EditOKRPage
            params={{ id: selectedOKRId }}
            initialData={okrs.find((okr) => okr._id === selectedOKRId)}
            setIsModalOpen={setIsModalOpen} // Pass the function
            setSelectedOKRId={setSelectedOKRId} // Pass the function
            onRefresh={fetchOKRs} // Pass the refresh function
            // vertical={okrs.find((okr) => okr._id === selectedOKRId)?.vertical} // Ensure vertical is passed
          />
        ) : (
          <CreateOKRPage
            setIsModalOpen={setIsModalOpen} // Pass the function
            onRefresh={fetchOKRs} // Pass the refresh function
          />
        )}
      </Modal>
      <Modal
        isOpen={confirmationModalOpen}
        onRequestClose={closeConfirmationModal}
        contentLabel="Confirm Deletion"
        className="confirmation-modal" // Apply the new class
        ariaHideApp={false}
      >
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete this OKR?</p>
        <button className="confirm-button" onClick={handleDeleteOKR}>
          Yes, delete
        </button>
        <button className="cancel-button" onClick={closeConfirmationModal}>
          Cancel
        </button>
      </Modal>
    </div>
  );
};

export default DashboardPage;
