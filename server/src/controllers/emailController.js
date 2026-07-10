import { brevo, apiInstance } from '../config/brevo.js';
import EmailLog from '../models/EmailLog.js';
import crypto from 'crypto';

/**
 * POST /api/emails/send
 * ----------------------------------------------------------------
 * รับ { recipients, subject, htmlContent } จาก Frontend
 * วนลูปส่งทีละคน และบันทึก Log ลง MongoDB
 *
 * 🔑 จุดสำคัญ: เราสร้าง Document ใน DB ก่อนส่ง
 *    แล้วเอา `_id` ของมันมาเป็น `tag` แนบไปกับอีเมล
 *    ภายหลัง Brevo จะยิง Webhook กลับพร้อม tag นี้
 *    ทำให้เราหา Document เดิมเจอและอัปเดตสถานะได้แม่นยำ 100%
 */
export async function sendEmail(req, res) {
  const { emails, subject, htmlContent } = req.validated;

  // สร้าง campaignId เพื่อจัดกลุ่มการส่งรอบนี้ (สะดวกตอนดูรายงาน)
  const campaignId = crypto.randomUUID();
  const results = [];

  for (const email of emails) {
    // 1) สร้าง Log ก่อนส่ง (status เริ่มที่ 'sent', tag จะเซ็ตด้านล่าง)
    const log = await EmailLog.create({
      email,
      subject,
      htmlContent,
      tag: '', // เซ็ตด้วย _id ทันทีด้านล่าง
      status: 'sent',
      campaignId,
      sentAt: new Date(),
    });

    // ใช้ _id เป็น tag (แปลงเป็น String เพื่อส่งให้ Brevo ได้)
    log.tag = String(log._id);
    await log.save();

    // 2) เรียก Brevo API ส่งอีเมล
    const sendSmtp = new brevo.SendSmtpEmail();
    sendSmtp.subject = subject;
    sendSmtp.htmlContent = htmlContent;
    sendSmtp.sender = {
      name: process.env.SENDER_NAME || 'No Reply',
      email: process.env.SENDER_EMAIL,
    };
    sendSmtp.to = [{ email }];
    sendSmtp.tags = [log.tag]; // 👈 แนบ tag ให้ Webhook จับคู่ได้

    try {
      const data = await apiInstance.sendTransacEmail(sendSmtp);
      log.brevoMessageId = data.messageId || null;
      await log.save();
      results.push({ email, status: 'sent', messageId: data.messageId });
    } catch (err) {
      // ถ้าส่งไม่สำเร็จ อัปเดตสถานะเป็น 'failed'
      log.status = 'failed';
      await log.save();
      const message = err.response?.body?.message || err.message;
      results.push({ email, status: 'failed', error: message });
    }
  }

  const successCount = results.filter((r) => r.status === 'sent').length;
  res.json({ campaignId, successCount, results });
}
