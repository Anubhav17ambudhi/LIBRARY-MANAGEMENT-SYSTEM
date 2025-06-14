import express from 'express';
import { login, register, verifyOTP,logout, getUser, forgotPassword, resetPassword, updatePassword } from '../controllers/auth.controller.js';
import { isAuthenticated } from '../middlewares/authmiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP); // Assuming verifyOTP is also handled by the register function for simplicity
router.post('/login', login);
router.get('/logout', isAuthenticated,logout);
router.get('/me', isAuthenticated,getUser);
router.post('/password/forgot',forgotPassword);
router.put('/password/reset/:token',resetPassword);
router.put('/password/update',isAuthenticated,updatePassword);

export default router;