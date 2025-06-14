import { isAuthenticated,isAuthorized } from '../middlewares/authmiddleware.js';
import {addBook, deleteBook, getAllBook} from "../controllers/book.controller.js"; 
import express from 'express';
const router = express.Router();

router.post('/admin/add',isAuthenticated,isAuthorized("admin"),addBook);
router.get('/all',isAuthenticated,getAllBook);
router.delete('/delete/:id',isAuthenticated,isAuthorized("admin"),deleteBook);

export default router 