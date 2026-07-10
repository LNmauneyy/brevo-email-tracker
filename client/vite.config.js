import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev Proxy: ตอนรัน `npm run dev` Frontend จะเรียก '/api/...'
// แล้ว Vite ส่งต่อไป Backend ที่ port 5000 อัตโนมัติ (ไม่ต้องยุ่งกับ CORS)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
