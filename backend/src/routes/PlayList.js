const express = require("express");
const router = express.Router();
const Playlist = require("../models/PlayListModel.js");
const User = require("../models/UserModel.js");
const Song=require("../models/songModel.js");
router.post("/create", async (req, res) => {
  try {
    const { userId, name } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }
    const user = await User.findById(userId).populate("playlists");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    let playlistName = name;
    if (!playlistName) {
      const count = user.playlists.length;
      playlistName = `#MyPlaylist ${count + 1}`;
    }
    const playlist = await Playlist.create({
      name: playlistName,
      user: user._id,
    });
    user.playlists.push(playlist._id);
    await user.save();
    res.status(200).json({ message: "Playlist created", playlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/add-song", async (req, res) => {
  try {
    const { playlistId, songId } = req.body;
    if (!playlistId || !songId) {
      return res
        .status(400)
        .json({ error: "playlistId and songId are required" });
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }
    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await playlist.save();
    }
    res.status(200).json({ message: "Song added to playlist", playlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
