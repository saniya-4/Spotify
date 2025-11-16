import React, { useState, useEffect, useContext } from "react";
import { searchSongs } from "../api/songApi";
import { addSongToPlaylist, getPlaylistById } from "../api/playListApi";
import { PlaylistContext } from "../context/PlaylistContext";
import { PlayerContext } from "../context/PlayerContext";

const PlaylistSongSearch = ({ playlistId }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingSongId, setAddingSongId] = useState(null);
  const [songs, setSongs] = useState([]);
  const [playlistInfo, setPlaylistInfo] = useState(null);

  // Context
  const {
    currentTrack,
    playStatus,
    playPlaylist,
    playFromIndex,
    registerAudioRef,
  } = useContext(PlaylistContext);

  const { audioRef } = useContext(PlayerContext);

  // Register audioRef in PlaylistContext
  useEffect(() => {
    if (audioRef.current) registerAudioRef(audioRef.current);
  }, [audioRef]);

  // Load playlist
  useEffect(() => {
    if (!playlistId) return;

    const loadPlaylist = async () => {
      try {
        const res = await getPlaylistById(playlistId);
        if (res.playlist) {
          setPlaylistInfo(res.playlist);
          setSongs(res.playlist.songs || []);
        }
      } catch (err) {
        console.log("Failed to load playlist", err);
      }
    };
    loadPlaylist();
  }, [playlistId]);

  // Search songs
  useEffect(() => {
    if (!query) return setResults([]);
    const timeout = setTimeout(async () => {
      setLoading(true);
      const res = await searchSongs(query);
      if (res.songs) setResults(res.songs || []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  // Add song to playlist
  const handleAddSong = async (songId) => {
    if (!playlistId) return alert("Select a playlist first");
    try {
      setAddingSongId(songId);
      const res = await addSongToPlaylist(playlistId, songId);
      if (res.error) alert(res.error);
      else alert("Song added successfully");
      const updatedPlaylist = await getPlaylistById(playlistId);
      if (updatedPlaylist.playlist) {
        setSongs(updatedPlaylist.playlist.songs || []);
      }
    } catch (err) {
      console.log(err);
      alert("Failed to add song");
    } finally {
      setAddingSongId(null);
    }
  };

  // Total duration
  const totalDurationInSeconds = songs.reduce((acc, song) => {
    if (!song.duration) return acc;
    const [min, sec] = song.duration.split(":").map(Number);
    return acc + min * 60 + sec;
  }, 0);
  const minutes = Math.floor(totalDurationInSeconds / 60);
  const seconds = totalDurationInSeconds % 60;

  return (
    <div className="p-4 text-white">
      {/* Playlist Info */}
      {playlistInfo && (
        <div className="mb-6 flex items-center gap-4">
          {playlistInfo.image && (
            <img
              src={playlistInfo.image}
              alt={playlistInfo.name}
              className="w-32 h-32 rounded-lg object-cover"
            />
          )}
          <div>
            <h1 className="text-4xl font-bold">🎵 {playlistInfo.name}</h1>
            {playlistInfo.desc && (
              <p className="text-gray-400 text-sm">📝 {playlistInfo.desc}</p>
            )}
            <p className="text-gray-400 mt-1 text-sm">
              📚 {songs.length} song{songs.length > 1 ? "s" : ""} • ⏱️ {minutes}m{" "}
              {seconds}s
            </p>

            {/* Play All button */}
            {songs.length > 0 && (
              <button
                onClick={() => playPlaylist(songs)}
                className="mt-2 px-4 py-2 bg-green-500 rounded font-bold text-black"
              >
                ▶ Play All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Existing Songs */}
      {songs.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Songs in this playlist</h2>
          <div className="flex flex-col gap-3">
            {songs.map((song, idx) => {
              const isPlaying =
                currentTrack?._id === song._id && playStatus ? true : false;

              return (
                <div
                  key={song._id}
                  className={`flex items-center gap-10 p-3 hover:bg-[#242424] rounded ${
                    isPlaying ? "bg-[#1db954]" : ""
                  }`}
                  onClick={() => playFromIndex(idx)}
                >
                  {/* Song Number */}
                  <p className="text-gray-400 w-6 text-right">{idx + 1}.</p>

                  {/* Song Image */}
                  <img
                    src={song.image}
                    alt={song.name}
                    className="w-16 h-16 object-cover rounded"
                  />

                  {/* Song Name + Album */}
                  <div className="flex flex-col justify-center flex-1 ml-2">
                    <div className="flex items-center gap-20">
                      <p className="font-semibold text-white">{song.name}</p>
                      <span className="text-gray-400 text-sm">🎼 {song.album}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">{song.desc}</p>
                  </div>

                  {/* Duration */}
                  <p className="font-bold text-sm ml-auto">⏱️ {song.duration}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Add Songs */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-2">Add More Songs</h2>
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
              <img
                src={song.image}
                alt={song.name}
                className="w-full h-24 object-cover rounded"
              />
              <p className="text-white font-semibold mt-2 text-center">{song.name}</p>
              <p className="text-gray-400 text-sm">{song.artist}</p>
              <button
                onClick={() => handleAddSong(song._id)}
                disabled={addingSongId === song._id}
                className="mt-2 px-3 py-1 bg-green-500 rounded text-black font-bold"
              >
                {addingSongId === song._id ? "Adding..." : "Add"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistSongSearch;
