const express=require("express");
const cors=require('cors');
const songRouter=require('./src/routes/songRoutes.js');
const connectDb=require('./src/config/mongodb.js');
const connectCloudinary = require("./src/config/cloudinary.js");
const albumRouter = require("./src/routes/albumRoute.js");
const playlistRoutes=require('./src/routes/PlayList.js')
const userRoute=require("./src/routes/userRoutes.js")
require('dotenv').config();
const app=express();
const port=process.env.PORT ||4000;
connectDb();
connectCloudinary();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
console.log("Loaded userRoute:", userRoute);

app.use("/api/song",songRouter)
app.use('/api/album',albumRouter)
app.use('/api/playlist',playlistRoutes);
app.use("/api/users",userRoute);
// to connect backend and frontend


app.get('/',(req,res)=>
{
    res.send("API working");
})

app.listen(port,()=>
{
    console.log(`server is started on ${port}`);
})