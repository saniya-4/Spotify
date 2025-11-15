const express = require("express");
const router = express.Router();
const Playlist = require("../models/PlayListModel.js");
const User = require("../models/UserModel.js");
const Song=require("../models/songModel.js");
const cloudinary=require("cloudinary").v2;
const upload=require("../middlewares/multer");
router.post("/create",upload.single("image"),async(req,res)=>
{
  try{
    const {userId,name,description,image}=req.body;
    if(!userId)
    {
      return res.status(400).json({error:"UserId is required"});
    }
    const user = await User.findOne({ clerkId: userId }).populate("playlists");

    if(!user)
    {
      return res.status(404).json({error:"User not found"});
    }
    let alreadyExists=false;
    if(name)
    {
       alreadyExists=user.playlists.some((p)=>p.name.trim().toLowerCase()===name.trim().toLowerCase());
      
    }
    if(alreadyExists)
    {
      return res.status(400).json({error:`A playlist named ${name} already exists`});
    }
   let playlistName=name;
   if(!playlistName)
   {
    const count=user.playlists.length;
    playlistName=`#MyPlaylist ${count+1}`;
   }
   let imageUrl="";
   if(req.file)
   {
    const uploadResponse=await cloudinary.uploader.upload(req.file.path,{
      resource_type:"image",
    });
    imageUrl=uploadResponse.secure_url;
   }
    
   
   const playlist=await Playlist.create({
    name:playlistName,
    description:description || "",
    image:imageUrl,
    user:user._id,
   })
   user.playlists.push(playlist._id);
   await user.save();
   res.status(200).json({
    message:"Playlist created successfully",
    playlist,
   })
  }catch(err)
  {
    res.status(500).json({error:err.message});
  }
})
router.get("/user/:userId",async(req,res)=>
{
  try {
    const {userId}=req.params;
    const user=await User.findOne({clerkId:userId}).populate("playlists");
    if(!user)
    {
      return res.status(404).json({error:"User not found"});
    }
    res.status(200).json({
      playlists:user.playlists,
    })
  }catch(err){
    res.status(500).json({error:err.message});
  }
})
//to get the songs based on the search to add in the playlist
router.get("/search",async(req,res)=>
{
  try{
    const {q}=req.query;
    if(!q)
    {
      return res.status(400).json({error:"Query parameter is required"});
    }
    const songs=await Song.find({
      name:{$regex:q,$options:"i"}
    }).limit(10);
    res.status(200).json({songs});
  }catch(err)
  {
    res.status(500).json({error:err.message});
  }
})
module.exports = router;
