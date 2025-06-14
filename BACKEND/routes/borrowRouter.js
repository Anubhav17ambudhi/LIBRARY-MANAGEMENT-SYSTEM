import express from 'express';
import { isAuthenticated, isAuthorized } from '../middlewares/authmiddleware.js';
import { recordBorrowedBooks,borrowedBooks,returnBorrowedBooks,getBorrowedBooksForAdmin } from '../controllers/borrow.controller.js';

const router = express.Router();

router.post('/record-borrow-book/:id',isAuthenticated,isAuthorized("admin"),recordBorrowedBooks);

router.get('/borrowed-books-by-user',isAuthenticated,isAuthorized("admin"),getBorrowedBooksForAdmin);

router.get('/my-borrowed-books',isAuthenticated,borrowedBooks);

router.put('/return-borrowed-book/:bookId',isAuthenticated,isAuthorized("admin"),returnBorrowedBooks);

export default router;