const express=require("express");
const app=express();
const userRoute=require("./Routes/userRoute.js");
const connectDB=require("./config/db.js");
require("dotenv").config();
app.use(express.json());
connectDB();
app.get("/",(req,res)=>{
    res.send("hello world ");
})
app.use("/api/user",userRoute);
app.listen(5000,()=>{
    console.log("server is running on port 5000");
})