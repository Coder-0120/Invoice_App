const express = require("express");
const router = express.Router();
const User = require("../Models/userSchema.js");
const bcrypt = require("bcrypt");

//  Register new user
router.post("/register",async(req,res)=>{
    try{
        const {name,email,password}=req.body;
        const existUser=await User.findOne({email});
        if(existUser){
            return res.status(400).json({message:"User already exists"});
        }
         const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await User.create({name,email,password:hashedPassword});
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
        const isMatch = existUser ? await bcrypt.compare(password, existUser.password) : false;
        if(!existUser||!isMatch){
            return res.status(401).json({message:'Invalid email or password'});
        }
        return res.status(200).json({message:'Login successful',userInfo:{
            userId:existUser._id,
            name:existUser.name,
            email:existUser.email
        }} );
    }
    catch(error){
        return res.status(500).json({message:'Internal server error'});
    }
})

// update user
router.put("/update/:id",async(req,res)=>{
    const userId=req.params.id;
    const {name}=req.body;
    try{
        const updatedUser=await User.findByIdAndUpdate(userId,{name},{new:true});
        if(!updatedUser){
            return res.status(404).json({message:'User not found'});
        }   
        return res.status(200).json({message:'User updated successfully',user:updatedUser});
    }
    catch(error){
        return res.status(500).json({message:'Internal server error'});
    }
})


// fetch userProfile by its userId(login user)
router.get("/profile/:id",async(req,res)=>{
    const userId=req.params.id;
    try{
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({message:'User not found'});
        }
        return res.status(200).json({message:'User profile fetched successfully',user:{
            name:user.name,
            email:user.email
        }});
    }
    catch(error){
        return res.status(500).json({message:'Internal server error'});
    }
});

module.exports=router;