import React, { useState } from "react";
import { createPlaylist } from "../api/playListApi";

const PlayList = ({ userId }) => {
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading,setLoading]=useState(false);
  const [message, setMessage] = useState("");

  const handleCreatePlaylist = async () => {
    if (!userId) {
      setMessage("User ID is missing!");
      return;
    } 
    if(loading)return;
    setLoading(true);

    try{const res = await createPlaylist(
      userId,
      playlistName,
      playlistDescription,
      imageFile
    );

    if (res.playlist) {
      setMessage(`Playlist "${res.playlist.name}" created!`);
      

      setPlaylistName("");
      setPlaylistDescription("");
      setImageFile(null);
    } else {
      setMessage(res.error || "Error creating playlist");
    }}catch(err)
    {
      setMessage(err.message || 
        "Error creating playlists"
      );
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 rounded-xl bg-gradient-to-b from-[#3a3a3a] to-[#121212] text-white shadow-2xl">

      {/* HEADER LIKE SPOTIFY */}
      <h1 className="text-4xl font-extrabold mb-8">Create a playlist</h1>

      <div className="flex gap-8">

        {/* IMAGE SECTION */}
        <label className="w-48 h-48 bg-[#2a2a2a] rounded-md flex items-center justify-center cursor-pointer overflow-hidden hover:bg-[#333] transition">
          {imageFile ? (
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-lg">Upload image</span>
          )}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </label>

        {/* RIGHT SIDE FORM */}
        <div className="flex-1">
          {/* NAME */}
          <div className="mb-5">
            <label className="text-gray-300 text-sm">Name</label>
            <input
              type="text"
              placeholder="My Playlist"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="w-full mt-1 p-3 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring focus:ring-green-500"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mb-5">
            <label className="text-gray-300 text-sm">Description</label>
            <textarea
              placeholder="Add an optional description"
              value={playlistDescription}
              onChange={(e) => setPlaylistDescription(e.target.value)}
              className="w-full mt-1 p-3 rounded bg-[#2a2a2a] text-white h-32 resize-none focus:outline-none focus:ring focus:ring-green-500"
            />
          </div>

          {/* CREATE BUTTON */}
          <button
            onClick={handleCreatePlaylist}
            disabled={loading}
            className="bg-green-500 text-black font-bold py-3 px-10 rounded-full hover:bg-green-400 transition"
          >
            {
              loading?
               (<div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating...
             </div>):("Create")
            }
          </button>
        </div>
      </div>

      {/* STATUS MESSAGE */}
      {message && (
        <p className="text-center mt-6 text-red-400 font-semibold">
          {message}
        </p>
      )}
    </div>
  );
};

export default PlayList;
