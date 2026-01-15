const express = require("express");
const router = express.Router();
const User = require("../Models/userSchema.js");

//  Register new user
router.post("/register",async(req,res)=>{
    try{
        const {name,email,password}=req.body;
        const existUser=await User.findOne({email});
        if(existUser){
            return res.status(400).json({message:"User already exists"});
        }
        await User.create({name,email,password});
        return res.status(201).json({message:'User registered successfully'});

    }
    catch(error){
        res.status(500).json({message:"Internal server error"});
    }
})

// Login user
router.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    try{
        const existUser=await User.findOne({email});
        if(!existUser||existUser.password!==password){
            return res.status(401).json({message:'Invalid email or password'});
        }
        return res.status(200).json({message:'Login successful',userId:existUser._id} );
    }
    catch(error){
        return res.status(500).json({message:'Internal server error'});
    }
})

// update user
router.put("/update/:id",async(req,res)=>{
    const userId=req.params.id;
    const {name,password}=req.body;
    try{
        const updatedUser=await User.findByIdAndUpdate(userId,{name,password},{new:true});
        if(!updatedUser){
            return res.status(404).json({message:'User not found'});
        }   
        return res.status(200).json({message:'User updated successfully',user:updatedUser});
    }
    catch(error){
        return res.status(500).json({message:'Internal server error'});
    }
})

module.exports=router;