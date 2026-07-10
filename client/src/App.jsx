import { Routes, Route, NavLink } from 'react-router-dom';
import SendEmail from './pages/SendEmail.jsx';
import Dashboard from './pages/Dashboard.jsx';

// NavLink จะได้ class 'active' ตอนหน้านั้นถูกเลือก
const linkClass = ({ isActive }) =>
  isActive ? 'text-indigo-600 font-medium' : 'text-slate-500 hover:text-slate-800';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200">
        <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
          <span className="font-bold text-indigo-600">📧 Brevo Tracker</span>
          <NavLink to="/" className={linkClass}>
            ส่งอีเมล
          </NavLink>
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
        </nav>
      </header>

      {/* เนื้อหาหลัก */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<SendEmail />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}
