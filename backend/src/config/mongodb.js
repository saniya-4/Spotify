const mongoose=require('mongoose');
const connectDb=async()=>
{
    try
    {
        await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log("mongodb connected successfully");
    }catch(error)
    {
        console.log("mongo db connection failed",error);
    }


}
module.exports=connectDb;