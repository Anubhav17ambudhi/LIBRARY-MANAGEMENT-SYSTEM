import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Book } from "../models/book.model.js";
import { User } from "../models/user.model.js";
import errorHandler from "../middlewares/errorMiddlewares.js";

export const addBook = catchAsyncError(async (req, res, next) => {
  const {title, author, description, price, quantity} = req.body;
  if (!title || !author || !description || !price || !quantity) {
    return next(new errorHandler("Please provide all required fields", 400));
  }
  const book = await Book.create({
    title,
    author,
    description,
    price,
    quantity
  });
  res.status(201).json({
    success: true,
    message: "Book added successfully",
    book
  });
})
  
export const getAllBook = catchAsyncError(async (req, res, next) => {
  const books = await Book.find()
  res.status(200).json({
    success: true,
    message: "All books fetched successfully",
    books
  });
})  

export const deleteBook = catchAsyncError(async (req, res, next) => {
  const {id} = req.params;
  const book  = await Book.findById(id);
  if (!book) {
    return next(new errorHandler("Book not found", 404));
  }
  await book.deleteOne();
  res.status(200).json({
    success: true,
    message: "Book deleted successfully"
  });
})  