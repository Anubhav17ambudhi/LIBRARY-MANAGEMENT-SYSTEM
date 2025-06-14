// import { JsonWebTokenError } from "jsonwebtoken";
import { catchAsyncError } from "./catchAsyncError.js";
import errorHandler from "./errorMiddlewares.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const isAuthenticated = catchAsyncError(async (req,res,next) => {
  const {token} = req.cookies;
  if(!token){
    return next(new errorHandler("User is not authenticated", 401));
  }
  const decoded = jwt.verify(token,process.env.JWT_SECRET );
  // console.log(decoded)

  req.user = await User.findById(decoded.id);
  next()
})

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new errorHandler("User not found in request", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new errorHandler(`Role:with this role (${req.user.role}) is not allowed to access this resource`, 403));
    }
    next();
  };
}