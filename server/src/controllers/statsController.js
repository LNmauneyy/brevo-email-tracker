import EmailLog from '../models/EmailLog.js';

/**
 * GET /api/stats/summary
 * ----------------------------------------------------------------
 * สถิติรวมสำหรับการ์ดบน Dashboard
 * - total: ส่งทั้งหมด
 * - delivered: ส่งสำเร็จ
 * - opened: เปิดอ่านแล้ว
 * - openRate: อัตราการเปิดอ่าน (%)
 */
export async function getStats(req, res) {
  const [total, delivered, opened, failed] = await Promise.all([
    EmailLog.countDocuments(),
    EmailLog.countDocuments({ status: 'delivered' }),
    EmailLog.countDocuments({ status: 'opened' }), // opened ถือว่าส่งสำเร็จแล้ว
    EmailLog.countDocuments({ status: 'failed' }),
  ]);

  // Open Rate = เปิดอ่าน / ส่งทั้งหมด × 100
  const openRate = total > 0 ? ((opened / total) * 100).toFixed(1) : '0.0';

  res.json({
    total,
    delivered,
    opened,
    failed,
    openRate: Number(openRate),
  });
}

/**
 * GET /api/stats/recipients?page=1&limit=20&status=opened
 * ----------------------------------------------------------------
 * ดึงรายชื่อผู้รับแบบแบ่งหน้า (pagination) ให้ตาราง Dashboard
 * รองรับกรองตาม status
 */
export async function getRecipients(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [rows, total] = await Promise.all([
    EmailLog.find(filter)
      .sort({ sentAt: -1 }) // ใหม่สุดอยู่บน
      .skip((page - 1) * limit)
      .limit(limit),
    EmailLog.countDocuments(filter),
  ]);

  res.json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    rows,
  });
}
