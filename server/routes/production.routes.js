import express from 'express';
import {
  getProductions,
  getProduction,
  createProduction,
  updateProduction,
  deleteProduction,
  getProductionStats
} from '../controllers/production.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getProductionStats);

router.route('/')
  .get(getProductions)
  .post(createProduction);

router.route('/:id')
  .get(getProduction)
  .put(updateProduction)
  .delete(deleteProduction);

export default router;
