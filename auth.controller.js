import { send } from "process";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import errorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js";
import { generteForgotPasswordEmailTemplate } from "../utils/emailTemplate.js";
import { sendEmail } from "../utils/sendEmail.js";

export const register = catchAsyncError(async(req,res,next) => {
  try {
    const {name,email,password} = req.body;
    if(!name || !email || !password) {
      return next(new errorHandler("Please provide all fields", 400));
    }
    const isRegistered = await User.findOne({email,accountVerified: true});
    if(isRegistered) {
      return next(new errorHandler("User already registered", 400));
    }
    const registrationAttemptsByUser = await User.find({
      email,
      accountVerified: false,
    })
    if(registrationAttemptsByUser.length >= 5) {
      return next(new errorHandler("You have exceeded the maximum registration attempts. Please try again later.", 400));
    }
    if(password.length < 8 || password.length > 16) {
      return next(new errorHandler("Password must be at least 8 characters long and less than 16 characters", 400));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword, 
    })
    const verificationCode = await user.generateVerificationCode();
    await user.save();
    await sendVerificationEmail(user.email, verificationCode, res);
  } catch (error) {
    next(error);
  }
});

export const verifyOTP = catchAsyncError(async(req,res,next) => {
  const {email, otp}  = req.body;
  if(!email || !otp) {
    return next(new errorHandler("Please provide all fields", 400));
  }
  try {
    const uesrAllEntries = await User.find({
      email,
      accountVerified: false
    }).sort({createdAt: -1});

    if(uesrAllEntries.length === 0) {
      return next(new errorHandler("No unverified user found with this email", 404));
    }

    let user;
    if(uesrAllEntries.length > 1) {
      user = uesrAllEntries[0];
      await User.deleteMany({
        _id: { $ne: user._id },// Keep the most recent entry
        email,
        accountVerified: false
      })
    }
    else{
      user = uesrAllEntries[0];
    }

    if(user.verificationCode !== Number(otp)) {
      return next(new errorHandler("Invalid OTP", 400));
    }
    const currentTime = Date.now();

    const verificationCodeExpire = new Date(user.verificationCodeExpire).getTime();

    if(currentTime > verificationCodeExpire) {
      return next(new errorHandler("OTP has expired", 400));
    }

    user.accountVerified = true;
    user.verificationCode = null; // Clear the verification code
    user.verificationCodeExpire = null; // Clear the expiration time
    await user.save({validateModifiedOnly:false});//only validates the modified data not all data

    sendToken(user,200,"accountVerified",res)
  } catch (error) {
    return next(new errorHandler("Internal Server Error", 500));
  }
});

export const login = catchAsyncError(async(req,res,next) => {
  const {email, password} = req.body;
  if(!email || !password) {
    return next(new errorHandler("Please provide all fields", 400));
  }
  const user = await User.findOne({email, accountVerified: true}).select("+password");
  if(!user) {
    return next(new errorHandler("Invalid email or password", 400));
  }
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if(!isPasswordMatched) {
    return next(new errorHandler("Invalid email or password", 400));
  }
  sendToken(user, 200, "User login successfull", res);
})

export const logout = catchAsyncError(async(req,res,next) => {
  res.status(200).cookie("token","",{
    expires: new Date(Date.now()),
    httpOnly: true,
  }).json({
    success: true,
    message: "Logged out successfully"
  })
});

export const getUser = catchAsyncError(async(req,res,next) => {
  const user = req.user
  res
  .status(200)
  .json({
    success: true,
    user
  })
})

export const forgotPassword = catchAsyncError(async(req,res,next) => {
  if(!req.body.email){
    return next(new errorHandler("Please provide email", 400));
  }
  const {email} = req.body;
  if(!email) {
    return next(new errorHandler("Please provide email", 400));
  }
  const user = await User.findOne({email, accountVerified: true});
  if(!user) {
    return next(new errorHandler("Invalid Email", 400));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({validateModifiedOnly: false});

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = generteForgotPasswordEmailTemplate(resetPasswordUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "Bookworm Library management Password Reset Request",
      message
    })
    res
    .status(200)
    .json({
      success: true,
      message: `Email sent to ${user.email} with password reset instructions`
    })
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({validateBeforeSave: false});
    return next(new errorHandler(error.message, 500));
  }
});

export const resetPassword = catchAsyncError(async(req,res,next) => {
  const {token} = req.params;
  const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() } // Check if the token is still valid
  });
  if(!user){
    return next(new errorHandler("Invalid or expired reset token", 400));
  }

  if(req.body.password !== req.body.confirmPassword) {
    return next(new errorHandler("Passwords do not match", 400));
  }

  if(req.body.password.length < 8 || req.body.password.length > 16) {
    return next(new errorHandler("Password must be at least 8 characters long and less than 16 characters", 400));
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;    
  await user.save({validateModifiedOnly: false})

  sendToken(user, 200, "Password reset successfully", res);
});

export const updatePassword = catchAsyncError(async(req,res,next) => {
  const user = await User.findById(req.user._id).select("+password");
  const {currentPassword, newPassword, confirmPassword} = req.body;
  if(!currentPassword || !newPassword || !confirmPassword) {
    return next(new errorHandler("Please provide all fields", 400));
  }

  const isPasswordMatched = await bcrypt.compare(currentPassword, user.password);
  if(!isPasswordMatched) {
    return next(new errorHandler("Current password is incorrect", 400));
  }
  if(newPassword.length < 8 || newPassword.length > 16) {
    return next(new errorHandler("Password must be at least 8 characters long and less than 16 characters", 400));
  }
  if(newPassword !== confirmPassword) {
    return next(new errorHandler("New password and confirm password do not match", 400));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save({validateModifiedOnly: false});

  res
  .status(200)
  .json({
    success: true,
    message: "Password updated successfully"
  });
})