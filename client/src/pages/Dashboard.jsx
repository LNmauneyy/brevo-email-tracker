import { useState, useEffect } from 'react';
import { api } from '../api.js';
import StatCard from '../components/StatCard.jsx';
import RecipientsTable from '../components/RecipientsTable.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [data, setData] = useState({ rows: [], total: 0 });
  const [statusFilter, setStatusFilter] = useState('');

  // ดึงทั้งสรุป + รายชื่อพร้อมกัน
  async function load() {
    const [s, r] = await Promise.all([
      api.get('/stats/summary'),
      api.get('/stats/recipients', {
        params: { status: statusFilter || undefined, limit: 50 },
      }),
    ]);
    setStats(s.data);
    setData(r.data);
  }

  // โหลดครั้งแรก + รีเฟรชอัตโนมัติทุก 5 วิ (Real-time)
  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id); // เคลียร์ตอนออกจากหน้า
  }, [statusFilter]);

  if (!stats) return <p className="text-slate-400">กำลังโหลด...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="text-xs text-slate-400">🔄 อัปเดตอัตโนมัติทุก 5 วินาที</span>
      </div>

      {/* การ์ดสรุปตัวเลข */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="ส่งทั้งหมด" value={stats.total} color="indigo" />
        <StatCard label="ส่งสำเร็จ" value={stats.delivered} color="green" />
        <StatCard label="เปิดอ่านแล้ว" value={stats.opened} color="blue" />
        <StatCard label="Open Rate" value={`${stats.openRate}%`} color="purple" />
      </div>

      {/* ตัวกรองสถานะ */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm text-slate-500">กรองสถานะ:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg p-1.5 text-sm"
        >
          <option value="">ทั้งหมด</option>
          <option value="sent">ส่งแล้ว</option>
          <option value="delivered">ส่งสำเร็จ</option>
          <option value="opened">เปิดอ่านแล้ว</option>
          <option value="failed">ล้มเหลว</option>
        </select>
      </div>

      {/* ตารางรายชื่อผู้รับ */}
      <RecipientsTable rows={data.rows} />
    </div>
  );
}
