// สไตล์สีแบจสถานะ (แยกสีชัดเจนตามที่ร้องขอ)
const STATUS_STYLES = {
  sent: 'bg-slate-100 text-slate-600',
  delivered: 'bg-green-100 text-green-700',
  opened: 'bg-blue-100 text-blue-700',
  failed: 'bg-red-100 text-red-700',
  bounced: 'bg-orange-100 text-orange-700',
};

const STATUS_LABEL = {
  sent: 'ส่งแล้ว',
  delivered: 'ส่งสำเร็จ',
  opened: 'เปิดแล้ว',
  failed: 'ล้มเหลว',
  bounced: 'ตีกลับ',
};

// แปลง Date เป็นข้อความ ถ้าไม่มีค่าแสดง '-'
function fmt(d) {
  if (!d) return '-';
  return new Date(d).toLocaleString('th-TH');
}

export default function RecipientsTable({ rows }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">อีเมลผู้รับ</th>
            <th className="px-4 py-3 font-medium">วันเวลาที่ส่ง</th>
            <th className="px-4 py-3 font-medium">สถานะ</th>
            <th className="px-4 py-3 font-medium">เวลาที่เปิดอ่าน</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                ยังไม่มีข้อมูล
              </td>
            </tr>
          )}

          {rows.map((r) => (
            <tr key={r._id} className="hover:bg-slate-50">
              <td className="px-4 py-3">{r.email}</td>
              <td className="px-4 py-3 text-slate-500">{fmt(r.sentAt)}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    STATUS_STYLES[r.status] || 'bg-slate-100'
                  }`}
                >
                  {STATUS_LABEL[r.status] || r.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">{fmt(r.openedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
