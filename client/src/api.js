import axios from 'axios';

// ตอน dev: VITE_API_URL ไม่ได้เซ็ต → ใช้ '/api' ซึ่ง Vite proxy ส่งต่อไป backend (:5000)
// ตอน prod (Render): เซ็ต VITE_API_URL = https://<backend>.onrender.com/api
//   → เรียกหา backend แบบเต็ม URL ได้เลย (Vite ฝังค่านี้ตอน build)
const BASE = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({ baseURL: BASE });
