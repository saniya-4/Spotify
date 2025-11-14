const express = require("express");
const router = express.Router();
const User = require("../models/UserModel.js");

router.post("/sync", async (req, res) => {
  try {
    const { clerkId, name, email } = req.body;
 
    if (!clerkId) {
      return res.status(400).json({ error: "clerkId is required" });
    }

    let user = await User.findOne({ clerkId });

    if (!user) {
      // Create new user
      user = await User.create({
        clerkId,
        name,
        email
      });
    } else {
      // Update name & email if changed
      user.name = name || user.name;
      user.email = email || user.email;
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
