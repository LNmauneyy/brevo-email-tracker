// โหลด .env ก่อนโมดูลอื่นทั้งหมด (side-effect import)
import 'dotenv/config';

import app from './app.js';
import { connectDB } from './db.js';

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server รันที่ http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('ไม่สามารถเชื่อมต่อ Database ได้:', err);
    process.exit(1);
  });
