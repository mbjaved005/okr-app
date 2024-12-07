import { getToken } from "./jwt";

export const getUserFullName = async (): Promise<string> => {
  const token = getToken();
  try {
    const response = await fetch("/api/user/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const option = `${data.fullName} ${data.email}`;
      return option;
    } else {
      console.error("Failed to fetch user profile");
      return "Unknown User";
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return "Unknown User";
  }
};
