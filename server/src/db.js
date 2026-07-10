import mongoose from 'mongoose';

/**
 * เชื่อมต่อ MongoDB
 * เรียกใช้ครั้งเดียวตอนรัน Server
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('❌ MONGODB_URI ไม่ได้ถูกตั้งค่าใน .env');

  await mongoose.connect(uri);
  console.log('✅ MongoDB เชื่อมต่อสำเร็จ');
}
