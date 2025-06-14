import express from 'express';
import { getAllUsers,registerNewAdmin } from '../controllers/user.controller.js';
import { isAuthenticated, isAuthorized } from '../middlewares/authmiddleware.js';

const router = express.Router();

router.get('/all', isAuthenticated, isAuthorized('admin'), getAllUsers);
router.post('/add-new-Admin', isAuthenticated, isAuthorized('admin'), registerNewAdmin);

export default router;