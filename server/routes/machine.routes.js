import express from 'express';
import {
  getMachines,
  getMachine,
  createMachine,
  updateMachine,
  deleteMachine,
  bulkDeleteMachines,
  assignWorker,
  getMachineProduction,
  getMachineStats
} from '../controllers/machine.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMachines)
  .post(createMachine);

router.post('/bulk-delete', bulkDeleteMachines);

router.route('/:id')
  .get(getMachine)
  .put(updateMachine)
  .delete(deleteMachine);

router.put('/:id/assign-worker', assignWorker);
router.get('/:id/production', getMachineProduction);
router.get('/:id/stats', getMachineStats);

export default router;
