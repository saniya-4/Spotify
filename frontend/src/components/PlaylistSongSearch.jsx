import React, { useState, useEffect } from "react";
import { searchSongs } from "../api/songApi"; // Axios fetch from /song/search

const PlaylistSongSearch = ({ onAddSong }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return setResults([]);
    const timeout = setTimeout(async () => {
      setLoading(true);
      const res = await searchSongs(query);
      if (res.songs) setResults(res.songs);
      setLoading(false);
    }, 300); // debounce input
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div>
      <h2 className="text-white font-bold text-2xl mb-4">Add Songs</h2>
      <input
        type="text"
        placeholder="Search for songs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 rounded bg-[#242424] text-white mb-4"
      />

      {loading && <p className="text-gray-400">Searching...</p>}

      <div className="flex gap-4 overflow-x-auto">
        {results.map((song) => (
          <div
            key={song._id}
            className="flex flex-col items-center p-2 bg-[#121212] rounded w-40"
          >
            <img src={song.image} alt={song.name} className="w-full h-24 object-cover rounded" />
            <p className="text-white font-semibold mt-2 text-center">{song.name}</p>
            <p className="text-gray-400 text-sm">{song.desc}</p>
            <button
              onClick={() => onAddSong(song._id)}
              className="mt-2 px-3 py-1 bg-green-500 rounded text-black font-bold"
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistSongSearch;
