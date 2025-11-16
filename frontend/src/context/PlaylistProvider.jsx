
import { useState, useEffect } from "react";
import { PlaylistContext } from "./PlaylistContext";

const PlaylistProvider = ({ children }) => {
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playStatus, setPlayStatus] = useState(false);
  const [audioRef, setAudioRef] = useState(null); // pass the audioRef from PlayerContext

  // Set the audioRef from PlayerContext (optional)
  const registerAudioRef = (ref) => {
    setAudioRef(ref);
  };

  // Play the full playlist from start
  const playPlaylist = (playlistSongs) => {
    if (!playlistSongs || playlistSongs.length === 0 || !audioRef) return;

    setCurrentPlaylist(playlistSongs);
    setPlaylistIndex(0);
    setCurrentTrack(playlistSongs[0]);
    setTimeout(() => audioRef.play(), 0);
    setPlayStatus(true);
  };

  // Play next song in playlist
  const nextPlaylistSong = () => {
    if (!audioRef || !currentPlaylist.length) return;

    if (playlistIndex < currentPlaylist.length - 1) {
      const nextIndex = playlistIndex + 1;
      setCurrentTrack(currentPlaylist[nextIndex]);
      setPlaylistIndex(nextIndex);
      setTimeout(() => audioRef.play(), 0);
      setPlayStatus(true);
    } else {
      // End of playlist
      setCurrentPlaylist([]);
      setPlayStatus(false);
    }
  };

  // Play previous song in playlist
  const previousPlaylistSong = () => {
    if (!audioRef || !currentPlaylist.length) return;

    if (playlistIndex > 0) {
      const prevIndex = playlistIndex - 1;
      setCurrentTrack(currentPlaylist[prevIndex]);
      setPlaylistIndex(prevIndex);
      setTimeout(() => audioRef.play(), 0);
      setPlayStatus(true);
    }
  };

  // Auto-play next song when current ends
  useEffect(() => {
    if (!audioRef) return;

    const handleEnded = () => {
      if (currentPlaylist.length) {
        nextPlaylistSong();
      } else {
        setPlayStatus(false);
      }
    };

    audioRef.addEventListener("ended", handleEnded);
    return () => audioRef.removeEventListener("ended", handleEnded);
  }, [audioRef, currentPlaylist, playlistIndex]);

  return (
    <PlaylistContext.Provider
      value={{
        currentPlaylist,
        playlistIndex,
        currentTrack,
        playStatus,
        playPlaylist,
        nextPlaylistSong,
        previousPlaylistSong,
        registerAudioRef,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export default PlaylistProvider;
