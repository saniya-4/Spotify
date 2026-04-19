const mongoose=require("mongoose");
const addRequestSchema=new mongoose.Schema({
    product:{
        type:String,
        required:true,
    },
    target_audience:{
       type:String,
       required:true,
    },
    platform:{
        type:String,
        required:true
    },
    ad_type:{
        type:String,
        required:true
    },
    duration:{
        type:String,
        required:true
    },
    deadline:{
        type:String,
        required:true
    },
    budget:{
        type:String,
        required:true
    },
    client_name:{
        type:String,
        required:true
    },
    brand_name:{
        type:String,
        required:true
    },
    business_type:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required: true 
    },
    phone:              { type: String, required: true },
    whatsapp:           { type: String, default: "" },
    city:               { type: String, required: true },
    website:            { type: String, default: "" },
    instagram_handle:   { type: String, default: "" },
    target_launch_date: { type: String, required: true },
    revision_rounds:    { type: String, required: true },
    extra_notes:        { type: String, default: "" },
    generated_brief: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    admin_note: { type: String, default: "" },


}, { timestamps: true })
module.exports=mongoose.model("AddRequest",addRequestSchema);