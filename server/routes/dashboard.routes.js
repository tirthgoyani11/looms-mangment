import express from 'express';
import {
  getDashboardStats,
  getMonthlyTrends,
  getTopPerformers,
  getQualityDistribution
} from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/monthly-trends', getMonthlyTrends);
router.get('/top-performers', getTopPerformers);
router.get('/quality-distribution', getQualityDistribution);

export default router;
