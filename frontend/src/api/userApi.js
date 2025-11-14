export const syncUser = async (clerkId,name,email) => {
  try {
    const response = await fetch("http://localhost:4000/api/users/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clerkId,name,email}),
    });

    return await response.json();
  } catch (err) {
    console.error("User sync failed:", err);
  }
};
