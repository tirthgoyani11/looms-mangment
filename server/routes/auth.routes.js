import express from 'express';
import { register, login, getMe, updatePassword, updateProfile, changePassword, getProfileStats, getRecentActivity } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/profile-stats', protect, getProfileStats);
router.get('/recent-activity', protect, getRecentActivity);

export default router;
