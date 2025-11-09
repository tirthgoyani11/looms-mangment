import express from 'express';
import {
  getQualityTypes,
  getQualityType,
  createQualityType,
  updateQualityType,
  deleteQualityType,
  getQualityStats
} from '../controllers/quality.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getQualityStats);

router.route('/')
  .get(getQualityTypes)
  .post(createQualityType);

router.route('/:id')
  .get(getQualityType)
  .put(updateQualityType)
  .delete(deleteQualityType);

export default router;
