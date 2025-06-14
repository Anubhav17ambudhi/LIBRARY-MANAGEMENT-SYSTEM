import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import errorHandler from "../middlewares/errorMiddlewares.js";
import { Borrow } from "../models/borrow.model.js";
import { Book } from "../models/book.model.js";
import { User } from "../models/user.model.js";
import { calculateFine } from "../routes/fineCalculator.js";
import mongoose from "mongoose";

export const recordBorrowedBooks = catchAsyncError(async (req,res,next) =>{
      const {id} = req.params;
      const {email} = req.body;

      const book = await Book.findById(id);
      if(!book){
          return next(new errorHandler("Book not found", 404));
      }

      const user = await User.findOne({email,accountVerified: true});

      if(!user){
        return next(new errorHandler("User not found", 404));
      }

      if(book.quantity === 0){
        return next(new errorHandler("Book not available",400));
      }

      const isAlreadyBorrowed = user.borrowedBooks.find(
        (b) => b.bookId.toString() === id && (b.returned === false)
      );
      if(isAlreadyBorrowed){
        return next(new errorHandler("Book already borrowed by this user", 400));
      }
      book.quantity -= 1;
      book.availability  = book.quantity > 0;
      await book.save();

      user.borrowedBooks.push({
        bookId: book._id,
        bookTitle: book.title,
        borrowedDate: Date.now(),
        dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
      })

      await user.save();
      await Borrow.create({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      book: book._id,
      dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
      price: book.price,
      });

      res.status(200).json({
        success: true,
        message: "Book borrowed successfully",
        book,
        user
      });
  })
export const returnBorrowedBooks = catchAsyncError(async (req,res,next) =>{
  const { bookId } = req.params;
  console.log("Book ID:", bookId);
  console.log(mongoose.Types.ObjectId.isValid(bookId));
  const { email } = req.body;
  const book = await Book.findById(bookId);
  if(!book){
    return next(new errorHandler("Book not found", 404));
  }
  const user = await User.findOne({email,accountVerified: true});
  if(!user){
    return next(new errorHandler("User not found", 404));
  }

  const borrowedBook = user.borrowedBooks.find(
    (b) => b.bookId.toString() === bookId && b.returned === false
  );
  if(!borrowedBook){
    return next(new errorHandler("This book was not borrowed by this user", 400));
  }
  borrowedBook.returned = true;
  await user.save();
  book.quantity += 1;
  book.availability = book.quantity > 0;
  await book.save();
  const borrowRecord = await Borrow.findOne({
    book: book._id,
    "user.email": email,
    returnDate: null
  });

  if(!borrowRecord){
    return next(new errorHandler("Borrow record not found", 404));
  }

  borrowRecord.returnDate = Date.now();
  const fine = calculateFine(borrowedBook.dueDate);
  borrowRecord.fine = fine;
  await borrowRecord.save();
  res.status(200).json({
    success: true,
    message: fine !== 0 ? `Book returned successfully with a total charge(fine + price) of ${fine+borrowRecord.price}`
     : `Book returned successfully without any fine. Total charges $ ${borrowRecord.price}`,
    book,
    user,
    fine
  });
})
export const borrowedBooks = catchAsyncError(async (req,res,next) =>{
  const {borrowedBooks}  = req.user;
  res.status(200).json({
    success: true,
    borrowedBooks: borrowedBooks
  });
})
export const getBorrowedBooksForAdmin = catchAsyncError(async (req,res,next) =>{
  const borrowedBook  = await Borrow.find()
  res.status(200).json({
    success: true,
    borrowedBooks: borrowedBook
  });
})