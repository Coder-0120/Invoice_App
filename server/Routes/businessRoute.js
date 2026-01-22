const express=require("express");
const router=express.Router();
const business=require("../Models/businessSchema");

// create business
router.post("/create",async(req,res)=>{
    try{
        const{businessName,businessOwner,Address,contactNo,gstNumber,tax,userId}=req.body;
        const existbusiness=await business.findOne({gstNumber});
        if(existbusiness){
            return res.status(400).json({message:"business already exist"});
        }
        await business.create({userId,businessName,businessOwner,Address,contactNo,gstNumber,tax});
        return res.status(201).json({message:"Business registered successfully"});
    }
    catch(error){
        return res.status(500).json({message:"Internal Server error"});
    }
})

// get my business 
router.get("/my/:userId",async(req,res)=>{
    const userId=req.params.userId;
    try{
        const mybussiness=await business.findOne({userId});
        if(!mybussiness){
            return res.status(400).json({message:"No business exist"});
        }
        return res.status(201).json({message:'business fetched successfully',business:mybussiness});

    }
    catch(error){
        return res.status(500).json({message:"Internal server error"});
    }
})

// update my business

router.put("/update/:userId",async(req,res)=>{
    try{
        const userId=req.params.userId;
        const{businessName,businessOwner,Address,contactNo,tax}=req.body;

        const updatedBusiness=await business.findOneAndUpdate({userId},{businessName,businessOwner,Address,contactNo,tax},{new:true});
        if(!updatedBusiness){
            return res.status(404).json({message:'business not found'});
        }   
        return res.status(200).json({message:'business updated successfully',business:updatedBusiness});

    }
    catch(error){
        return res.status(500).json({message:"Internal server error"});
    }
})

module.exports=router;