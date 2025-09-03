const mongoose=require('mongoose')
const albumSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    desc:{
        type:String,
        required:true,
    },
    bgColor:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    }
})
module.exports=mongoose.model('Album',albumSchema);