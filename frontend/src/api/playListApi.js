import axios from "axios";

export const createPlaylist = async (userId, name, description, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("name", name);
    formData.append("description", description);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const res = await axios.post(
      "http://localhost:4000/api/playlist/create",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  } catch (err) {
    console.log("Create playlist failed", err);
    return { error: err.response?.data?.error || err.message };
  }
};




export const getUserPlaylist = async (userId) => {
  try {
    const res = await axios.get(
      `http://localhost:4000/api/playlist/user/${userId}`
    );
    return res.data;
  } catch (err) {
    return { error: err.response?.data?.error || "Failed to fetch playlists" };
  }
};
export const addSongToPlaylist=async(playlistId,songId)=>
{
  try{
    const res=await axios.post(`http://localhost:4000/api/playlist/${playlistId}/add-song`,{songId});
    return res.data;
  }catch(err)
  {
    console.log("Add song failed",err.resonse?.data || err.message);
    return {error :err.response?.data?.error || err.message};
  }
}
export const getPlaylistById = async (playlistId) => {
  try {
    const res = await axios.get(`http://localhost:4000/api/playlist/${playlistId}`);
    return res.data; // returns { playlist: {...} } directly
  } catch(err) {
    console.log(err);
    return { error: "Failed to fetch playlist" };
  }
};