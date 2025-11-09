import express from 'express';
import {
  getTakas,
  getTaka,
  createTaka,
  updateTaka,
  deleteTaka,
  completeTaka
} from '../controllers/taka.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTakas)
  .post(createTaka);

router.route('/:id')
  .get(getTaka)
  .put(updateTaka)
  .delete(deleteTaka);

router.put('/:id/complete', completeTaka);

export default router;
