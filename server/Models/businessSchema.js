const mongoose=require("mongoose");
const businessSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    businessName:{
        type:String,
        required:true,
    },
    businessOwner:{
        type:String,
        required:true,
    },
    Address:{
        type:String,
        required:true,
    },
    contactNo:{
        type:String,
        required:true,
        minlength:10,
        maxlength:10,
    },
    GST_NO:{
        type:String,
        required:true,
    },
    tax: {
      cgst: {
        type: Number,
        default: 0,
      },
      sgst: {
        type: Number,
        default: 0,
      },
    },
    logo:{
        type:String,
        required:true,
    }
},{
    timestamps:true,
});
module.exports=mongoose.model("Business",businessSchema );

