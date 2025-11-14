const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    playlists: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Playlist"
        }
    ]
});

module.exports = mongoose.model("User", userSchema);
