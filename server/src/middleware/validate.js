/**
 * Util + Middleware ตรวจสอบอีเมลเบื้องต้น
 * ----------------------------------------------------------------
 * เช็ก 2 ระดับ:
 *  1) รูปแบบพื้นฐาน ต้องมี @ และ domain
 *  2) domain ต้องมีจุด และ TLD อย่างน้อย 2 ตัว (เช่น .com, .co.th)
 */

// รูปแบบ: something@domain.tld
const EMAIL_REGEX = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/;

export function isValidEmail(email) {
  if (typeof email !== 'string') return false;

  const match = email.trim().toLowerCase().match(EMAIL_REGEX);
  if (!match) return false;

  const domain = match[1];
  // domain ต้องแบ่งด้วยจุด และมี TLD อย่างน้อย 2 ตัวอักษร (a-z)
  const parts = domain.split('.');
  const allPartsNonEmpty = parts.every((p) => p.length > 0);
  const hasValidTld = /\.[a-z]{2,}$/i.test(domain);

  return allPartsNonEmpty && hasValidTld;
}

/**
 * Middleware ตรวจสอบ Payload ของ POST /api/emails/send
 * - รองรับ recipients เป็น Array หรือ String คั่นด้วย , หรือ \n
 * - ตรวจ subject / htmlContent ไม่ว่าง
 * - ตรวจรูปแบบอีเมลทุกคน
 * ถ้าผ่าน จะใส่ req.validated = { emails, subject, htmlContent } ให้ controller ใช้
 */
export function validateSendRequest(req, res, next) {
  const { recipients, subject, htmlContent } = req.body;

  // รับได้ทั้ง Array และ String
  const emails = Array.isArray(recipients)
    ? recipients
    : String(recipients || '')
        .split(/[\n,]/)
        .map((e) => e.trim())
        .filter(Boolean);

  if (!emails.length) {
    return res.status(400).json({ error: 'กรุณาระบุอีเมลผู้รับอย่างน้อย 1 รายการ' });
  }
  if (!subject || !subject.trim()) {
    return res.status(400).json({ error: 'กรุณาระบุ Subject' });
  }
  if (!htmlContent || !htmlContent.trim()) {
    return res.status(400).json({ error: 'กรุณาระบุ HTML Content' });
  }

  // หาอีเมลที่ไม่ถูกต้อง
  const invalid = emails.filter((e) => !isValidEmail(e));
  if (invalid.length) {
    return res.status(400).json({ error: 'พบอีเมลที่ไม่ถูกต้อง', invalid });
  }

  req.validated = {
    emails,
    subject: subject.trim(),
    htmlContent,
  };
  next();
}
