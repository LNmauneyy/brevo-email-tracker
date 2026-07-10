import express from 'express';
import { getStats, getRecipients } from '../controllers/statsController.js';

const router = express.Router();

// GET /api/stats/summary     → สถิติรวม
router.get('/summary', getStats);

// GET /api/stats/recipients  → รายชื่อผู้รับ (แบ่งหน้า + กรอง)
router.get('/recipients', getRecipients);

export default router;
