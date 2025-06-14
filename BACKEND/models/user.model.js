import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase : true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Do not return password in queries
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  accountVerified: {
    type: Boolean,
    default: false,
  },
  borrowedBooks:[
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Borrow",
        required: true,
      },
      returned: {
        type: Boolean,
        default: false,
      },
      borrowedDate: Date,
      bookTitle: String,
      dueDate: Date,
    }
  ],
  avatar: {
    publicId: String,
    url: String
  },
  verificationCode: Number,
  verificationCodeExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

userSchema.methods.generateVerificationCode = async function() {
  function generateRandomFiveDigitNumber(){
    const firstDigit = Math.floor(Math.random() * 9) + 1; // Ensure first digit is not zero
    const remainingDigits = Math.floor(Math.random() * 10000).toString().padStart(4,0); // Generate remaining 4 digits
    return parseInt(firstDigit + remainingDigits);
  }

  const verificationCode = generateRandomFiveDigitNumber();
  this.verificationCode = verificationCode;
  this.verificationCodeExpire = Date.now() + 15 * 60 * 1000; // Code valid for 15 minutes
  return verificationCode;
};

userSchema.methods.generateToken = function() {
  return jwt.sign(
    { 
    id: this._id, 
    },
    process.env.JWT_SECRET,
    {
    expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

userSchema.methods.getResetPasswordToken = function(){
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // Token valid for 15 minutes
  return resetToken;
}

export const User = mongoose.model("User", userSchema);