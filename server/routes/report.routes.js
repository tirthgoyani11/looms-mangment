import express from 'express';
import {
  getWorkerReport,
  getMachineReport,
  getSalaryReport,
  generatePDFReport
} from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/worker', getWorkerReport);
router.get('/machine', getMachineReport);
router.get('/salary', getSalaryReport);
router.post('/pdf', generatePDFReport);

export default router;
