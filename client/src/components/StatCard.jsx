// การ์ดแสดงตัวเลขสรุป 1 ใบ
const COLORS = {
  indigo: 'text-indigo-600',
  green: 'text-green-600',
  blue: 'text-blue-600',
  purple: 'text-purple-600',
};

export default function StatCard({ label, value, color = 'indigo' }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${COLORS[color] || COLORS.indigo}`}>{value}</p>
    </div>
  );
}
