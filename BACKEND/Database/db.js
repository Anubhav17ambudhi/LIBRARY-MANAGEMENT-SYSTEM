import mongoose from "mongoose";

export const connectDB = () => {
  mongoose.connect(process.env.MONGO_URI,{
    dbName: "MERN_STACK_LIBRARY_MANAGEMENT_SYSTEM"
  })
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch(err =>{
    console.log("Error connecting to database",err);
  })
}