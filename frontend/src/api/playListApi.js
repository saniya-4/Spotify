export const createPlaylist=async(userId,name)=>
{
    try {
    const response = await fetch("http://localhost:4000/api/playlist/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, name }),
    });
    return await response.json();
  } catch (err) {
    console.error("Create playlist failed:", err);
    return { error: err.message };
  }
}
export const addSongToPlaylist = async (playlistId, songId) => {
  try {
    const response = await fetch("http://localhost:4000/api/playlist/add-song", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playlistId, songId }),
    });
    return await response.json();
  } catch (err) {
    console.error("Add song to playlist failed:", err);
    return { error: err.message };
  }
};