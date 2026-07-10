import express from 'express';
import { sendEmail } from '../controllers/emailController.js';
import { validateSendRequest } from '../middleware/validate.js';

const router = express.Router();

// POST /api/emails/send  → ส่งอีเมล (มีการ validate ก่อนเข้า controller)
router.post('/send', validateSendRequest, sendEmail);

export default router;
