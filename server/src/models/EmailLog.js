import mongoose from 'mongoose';

/**
 * EmailLog Schema
 * ----------------------------------------------------------------
 * เก็บ Log ของทุกอีเมลที่ส่ง + สถานะล่าสุด
 * ฟิลด์สำคัญคือ `tag` ซึ่งเป็นตัวจับคู่ (match) กับ Webhook
 * ที่ Brevo ยิงกลับมา — เราใช้ `_id` ของ Document นี้เองเป็น tag
 */
const emailLogSchema = new mongoose.Schema(
  {
    // อีเมลผู้รับ
    email: { type: String, required: true, index: true },

    // หัวข้อ + เนื้อหาที่ส่ง (เก็บไว้เผื่อดูย้อนหลัง)
    subject: { type: String },
    htmlContent: { type: String },

    // 👈 แท็ก unique ที่แนบไปกับอีเมลตอนส่ง (เซ็ตเท่ากับ _id)
    // Brevo จะส่ง tag นี้กลับมาพร้อม Event ทำให้เราหา Document ได้แม่นยำ
    tag: { type: String, required: true, unique: true, index: true },

    // สถานะล่าสุดของอีเมล (ค่าเริ่มต้นคือ 'sent' หลังเรียก API สำเร็จ)
    status: {
      type: String,
      enum: ['sent', 'delivered', 'opened', 'bounced', 'failed'],
      default: 'sent',
      index: true,
    },

    // จัดกลุ่มการส่ง (กรณีส่งทีละหลายคนพร้อมกันใน 1 ครั้ง)
    campaignId: { type: String, index: true },

    // เวลาต่างๆ ตามสถานะ
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    openedAt: { type: Date },
    bouncedAt: { type: Date },

    // ข้อมูลเพิ่มเติมตอนผู้รับเปิดอีเมล (จาก Webhook event 'opened')
    openMeta: {
      ip: String,
      userAgent: String,
    },

    // message-id จาก Brevo (เผื่อใช้จับคู่สำรอง)
    brevoMessageId: String,
  },
  { timestamps: true } // สร้าง createdAt / updatedAt อัตโนมัติ
);

export default mongoose.model('EmailLog', emailLogSchema);
