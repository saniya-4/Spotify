const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    name: { type: String },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    } ,
    songs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "songModel"
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Playlist", playlistSchema);
