import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import errorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

export const getAllUsers = catchAsyncError(async(req,res,next) => {
  const users = await User.find({accountVerified: true});//all users and admin should be there
  res.status(200).json({
    success: true,
    users
  });
});

export const registerNewAdmin = catchAsyncError(async(req,res,next) => {
  if(!req.files || Object.keys(req.files).length === 0){
    return next(new errorHandler("Admin Avatar is required", 400));
  }

  const {name, email, password} = req.body;
  if(!name || !email || !password){
    return next(new errorHandler("Please provide all fields", 400));
  }

  const isRegistered = await User.findOne({email, accountVerified: true});
  if(isRegistered){
    return next(new errorHandler("Admin already registered", 400));
  } 
  if(password.length < 8 || password.length > 16){
    return next(new errorHandler("Password must be between 8 and 16 characters long", 400));
  }

  const {avatar}  = req.files;
  const allowedFileTypes = ["image/png","image/jpg","image/jpeg","image/webp"];
  if(!allowedFileTypes.includes(avatar.mimetype)){
    return next(new errorHandler("Invalid file type. Only png, jpg, jpeg and webp are allowed", 400));
  }
  const hashedPassword = await bcrypt.hash(password,10);
  const cloudinaryResponse = await cloudinary.uploader.upload(avatar.tempFilePath, {folder: "Library_Management_System_Admin_Avatars"});
  if(!cloudinaryResponse){
    console.error("Error uploading avatar to cloudinary:",cloudingaryResponse.error || "Unknown error");
    return next(new errorHandler("Error uploading avatar to cloudinary", 500));
  }

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    avatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url
    },
    role: "admin",
    accountVerified: true
  });

  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    user
  });
})