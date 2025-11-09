import express from 'express';
import {
  getWorkers,
  getWorker,
  createWorker,
  updateWorker,
  deleteWorker,
  bulkDeleteWorkers,
  getWorkerPerformance
} from '../controllers/worker.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWorkers)
  .post(createWorker);

router.post('/bulk-delete', bulkDeleteWorkers);

router.route('/:id')
  .get(getWorker)
  .put(updateWorker)
  .delete(deleteWorker);

router.get('/:id/performance', getWorkerPerformance);

export default router;
