import express from 'express';
import cors from 'cors';
import emailRoutes from './routes/email.js';
import webhookRoutes from './routes/webhook.js';
import statsRoutes from './routes/stats.js';

const app = express();

// เปิด CORS ให้ Frontend เรียกได้ (จำกัดเฉพาะ origin ของ client)
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json()); // รองรับ JSON Body (Brevo Webhook ส่งมาเป็น JSON)

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ต่อเส้นทาง API
app.use('/api/emails', emailRoutes);
app.use('/api/webhooks/brevo', webhookRoutes);
app.use('/api/stats', statsRoutes);

export default app;
