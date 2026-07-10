import EmailLog from '../models/EmailLog.js';

/**
 * POST /api/webhooks/brevo
 * ----------------------------------------------------------------
 * จุดรับ Webhook จาก Brevo
 * Brevo จะยิงเข้ามาเองแบบ Real-time เมื่อเกิด Event ต่างๆ
 * (delivered / opened / bounce ฯลฯ)
 *
 * Payload ตัวอย่าง (Event 'opened'):
 * {
 *   "event": "opened",
 *   "email": "user@test.com",
 *   "date": "2026-07-10 12:30:00",
 *   "ts": 1752145800,
 *   "tags": ["6690abc...id"],   // 👈 tag ที่เราแนบตอนส่ง
 *   "ip": "1.2.3.4",
 *   "user-agent": "Mozilla/5.0 ..."
 * }
 *
 * 🔐 หมายเหตุความปลอดภัย: ควรตรวจสอบว่า Request มาจาก Brevo จริง
 *    (Brevo รองรับ Webhook Secret — เปิดใช้ในหน้าตั้งค่า Webhook แล้วเช็กใน Header/Body)
 */
export async function handleBrevoWebhook(req, res) {
  // Brevo อาจส่งเป็น Object เดี่ยว หรือ Array ของ Events
  const events = Array.isArray(req.body) ? req.body : [req.body];

  for (const event of events) {
    const {
      event: eventType,
      email,
      tags,
      date,
      ts,
      ip,
      'user-agent': userAgent,
    } = event;

    if (!eventType) continue;

    // หา tag ที่เราแนบไป (รูปแบบ: _id ของ EmailLog)
    const tag = Array.isArray(tags) ? tags[0] : null;
    if (!tag) continue;

    // เตรียมข้อมูลที่จะอัปเดตตามประเภท Event
    const update = {};

    if (eventType === 'delivered') {
      update.status = 'delivered';
      update.deliveredAt = parseDate(date, ts);
    } else if (eventType === 'opened') {
      update.status = 'opened';
      update.openedAt = parseDate(date, ts);
      update.openMeta = { ip: ip || null, userAgent: userAgent || null };
    } else if (
      ['bounce', 'hard_bounce', 'soft_bounce', 'invalid_email'].includes(eventType)
    ) {
      update.status = 'bounced';
      update.bouncedAt = parseDate(date, ts);
    } else {
      // Event อื่น (click, unsubscribe ฯลฯ) ข้ามไป
      continue;
    }

    // อัปเดต Document ที่ตรงกับ tag — ไม่ทำลายฟิลด์อื่น (เช่น deliveredAt)
    await EmailLog.findOneAndUpdate({ tag }, update, { new: true });
  }

  // Brevo คาดว่า Endpoint ต้องตอบกลับ 2xx เสมอ
  res.status(200).json({ received: true });
}

/**
 * แปลงวันที่จาก Webhook ให้เป็น Date ของ JS
 * - ใช้ `ts` (unix timestamp วินาที) ถ้ามี (แม่นยำสุด)
 * - ไม่มี ให้ใช้ `date` ในรูป "YYYY-MM-DD HH:MM:SS" แปลงเป็น UTC
 */
function parseDate(date, ts) {
  if (ts) return new Date(ts * 1000);
  if (date) return new Date(String(date).replace(' ', 'T') + 'Z');
  return new Date();
}
