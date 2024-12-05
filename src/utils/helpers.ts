export const getInitials = (fullName: string) => {
  return fullName
    .split(" ")
    .map((name) => {
      const match = name.match(/^[A-Za-z]|\d+/g);
      return match ? match.join("") : "";
    })
    .join("");
};
