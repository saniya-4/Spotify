import React, { useState } from "react";
import { createPlaylist, addSongToPlaylist } from "../api/playListApi";
const PlayList = ({ userId }) => {
  const [playlistName, setPlaylistName] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  const [songId, setSongId] = useState("");
  const [message, setMessage] = useState("");
  const handleCreatePlaylist=async()=>
  {
    if (!userId) {
      setMessage("User ID is missing!");
      return;
    } 
    const res = await createPlaylist(userId, playlistName);
    if (res.playlist) {
      setMessage(`Playlist "${res.playlist.name}" created!`);
      setPlaylistId(res.playlist._id); // set playlistId for adding songs
      setPlaylistName(""); // reset input
    } else {
      setMessage(res.error || "Error creating playlist");
    }
  };
   const handleAddSong = async () => {
    if (!playlistId || !songId) {
      setMessage("Playlist ID and Song ID are required");
      return;
    }
    const res = await addSongToPlaylist(playlistId, songId);
    if (res.playlist) {
      setMessage(`Song added to "${res.playlist.name}"`);
      setSongId(""); // reset input
    } else {
      setMessage(res.error || "Error adding song");
    }
  };
  return (
    <div className="playlist-manager p-4 border rounded w-full max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-3">Playlist Manager</h2>

      {/* Create Playlist */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Playlist Name (optional)"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          className="border p-2 mr-2 w-[60%]"
        />
        <button
          onClick={handleCreatePlaylist}
          className="bg-blue-500 text-white px-3 py-2 rounded"
        >
          Create Playlist
        </button>
      </div>

      {/* Add Song to Playlist */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Playlist ID"
          value={playlistId}
          onChange={(e) => setPlaylistId(e.target.value)}
          className="border p-2 mr-2 w-[40%]"
        />
        <input
          type="text"
          placeholder="Song ID"
          value={songId}
          onChange={(e) => setSongId(e.target.value)}
          className="border p-2 mr-2 w-[40%]"
        />
        <button
          onClick={handleAddSong}
          className="bg-green-500 text-white px-3 py-2 rounded"
        >
          Add Song
        </button>
      </div>
      {message && <p className="text-red-500 font-semibold">{message}</p>}
    </div>
  );
};
export default PlayList;
