"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FormInput from "../components/FormInput"; // Import FormInput

const ResetPasswordPage = ({ getEmail }: { getEmail: string }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setIsResetMode(true);
    }
  }, []);

  const handlePasswordRecovery = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    console.log("Password recovery form submitted for email:", getEmail);

    try {
      const response = await fetch("/api/auth/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: getEmail }),
      });

      const data = await response.json();
      console.log("Password recovery response:", data);
      if (response.ok) {
        setMessage(
          "Reset password email sent successfully. Please check your inbox."
        );
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error during password recovery:", error);
      console.error(
        "Stack trace:",
        error instanceof Error ? error.stack : "No stack trace available"
      );
      setMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    console.log("Password reset form submitted with token:", token);

    try {
      const response = await fetch("/api/auth/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, oldPassword, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.removeItem("token");
        setMessage("Password reset successful. Redirecting to login...");
        router.push("/login");
        await window.location.reload();
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      console.error(
        "Stack trace:",
        error instanceof Error ? error.stack : "No stack trace available"
      );
      setMessage("Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div
        className="modal"
        style={{
          border: "2px solid black",
          borderRadius: "8px",
          padding: "10px",
          width: "400px",
          margin: "100px",
          backgroundColor: "white",
        }}
      >
        <h2 className="text-2xl font-bold text-center">
          {isResetMode ? "Reset Password" : "Password Recovery"}
        </h2>
        {isResetMode ? (
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <FormInput
              type="password"
              label="Old Password"
              value={oldPassword}
              onChange={setOldPassword}
              required
            />
            <FormInput
              type="password"
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordRecovery} className="space-y-6">
            <FormInput
              type="email"
              label="Email"
              value={getEmail}
              required
              onChange={() => {}}
              disabled={true}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Recovery Email"}
            </button>
          </form>
        )}
        {message && (
          <p
            className={`mt-3 text-sm text-center ${
              message.startsWith("Error") ? "text-red-500" : "text-green-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
