import { useState } from 'react';
import { api } from '../api.js';

// รูปแบบอีเมลพื้นฐาน (ฝั่ง Client ตรวจสอบเบื้องต้นก่อนส่ง)
const EMAIL_RE = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/;

export default function SendEmail() {
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState(
    '<h1>สวัสดี!</h1><p>นี่คืออีเมลทดสอบจาก Brevo Tracker</p>'
  );
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // แปลงข้อความเป็น Array อีเมล (คั่นด้วย , หรือขึ้นบรรทัดใหม่)
  const emails = recipients.split(/[\n,]/).map((e) => e.trim()).filter(Boolean);
  const invalid = emails.filter((e) => !EMAIL_RE.test(e));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!emails.length) return setMsg({ type: 'error', text: 'กรุณาระบุอีเมลผู้รับ' });
    if (invalid.length)
      return setMsg({ type: 'error', text: `อีเมลไม่ถูกต้อง: ${invalid.join(', ')}` });
    if (!subject.trim()) return setMsg({ type: 'error', text: 'กรุณาระบุ Subject' });

    setLoading(true);
    setMsg(null);
    try {
      const { data } = await api.post('/emails/send', {
        recipients: emails,
        subject,
        htmlContent,
      });
      setMsg({
        type: 'success',
        text: `✅ ส่งสำเร็จ ${data.successCount} รายการ`,
      });
      setRecipients('');
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.error || 'เกิดข้อผิดพลาดในการส่ง',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ส่งอีเมลผ่าน Brevo</h1>

      {msg && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            msg.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {msg.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200"
      >
        {/* ช่องอีเมลผู้รับ */}
        <div>
          <label className="block text-sm font-medium mb-1">
            อีเมลผู้รับ (คั่นด้วย , หรือขึ้นบรรทัดใหม่ได้)
          </label>
          <textarea
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            rows={3}
            placeholder="a@test.com, b@test.com"
            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <p className="text-xs text-slate-400 mt-1">
            {emails.length} รายการ
            {invalid.length > 0 && (
              <span className="text-red-500"> ({invalid.length} ไม่ถูกต้อง)</span>
            )}
          </p>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* HTML Content */}
        <div>
          <label className="block text-sm font-medium mb-1">HTML Content</label>
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            rows={8}
            className="w-full border border-slate-300 rounded-lg p-2 font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'กำลังส่ง...' : 'ส่งอีเมล'}
        </button>
      </form>
    </div>
  );
}
