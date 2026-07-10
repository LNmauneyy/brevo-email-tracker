import express from 'express';
import { handleBrevoWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// POST /api/webhooks/brevo → จุดรับ Event จาก Brevo (delivered / opened / bounce)
router.post('/', handleBrevoWebhook);

export default router;
