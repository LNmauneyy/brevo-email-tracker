# 🚀 คู่มือ Deploy (Render + MongoDB Atlas)

เอกสารนี้จะพา deploy ทั้ง Backend + Frontend ขึ้น Render ใช้ MongoDB Atlas เป็น Database
ไฟล์ `render.yaml`  already เตรียมไว้แล้ว (Blueprint) แค่ทำตามขั้นตอนด้านล่าง

---

## 0. เตรียมของ (สิ่งที่ต้องมีก่อน)
- [ ] บัญชี [Render](https://render.com) (สมัครฟรีได้)
- [ ] บัญชี [MongoDB Atlas](https://cloud.mongodb.com) (M0 Free tier)
- [ ] บัญชี [Brevo](https://brevo.com) + **API Key** + **อีเมลผู้ส่งที่ Verify แล้ว**
- [ ] Push โปรเจกต์นี้ไป GitHub/GitLab repository หนึ่ง

---

## 1. เตรียม MongoDB Atlas
1. สร้าง Cluster (เลือก **M0 Free**)
2. สร้าง Database User (เก็บ username/password ไว้)
3. ใน **Network Access** กด **Add IP Address** ▸ เลือก **Allow Access from Anywhere** (`0.0.0.0/0`) ← สำคัญให้ Render เข้าถึงได้
4. กด **Connect** ▸ เลือก **Drivers** ▸ คัดลอก Connection String
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/brevo_email_tracker
   ```
   แทน `<user>:<password>` ด้วย Database User จริง

---

## 2. Deploy ด้วย Render Blueprint
1. เข้า Render ▸ กด **New** ▸ **Blueprint**
2. เชื่อมต่อ GitHub/GitLab ▸ เลือก repo นี้
3. Render อ่าน `render.yaml` จะแสดง 2 Service:
   - `brevo-tracker-server` (Web Service)
   - `brevo-tracker-client` (Static Site)
4. กด **Apply** → Render จะ build ทั้งคู่

### กรอก Environment Variables (สำคัญ)
หลัง Apply ให้เข้าแต่ละ Service ▸ **Environment** แล้วกรอกค่าที่ตั้ง `sync: false` ไว้:

**brevo-tracker-server:**
| Key | Value |
|-----|-------|
| `MONGODB_URI` | URI จากข้อ 1 (Atlas) |
| `BREVO_API_KEY` | API Key จาก Brevo |
| `SENDER_EMAIL` | อีเมลผู้ส่งที่ Verify แล้ว |
| `SENDER_NAME` | ชื่อแสดง เช่น `My App` |
| `CLIENT_ORIGIN` | `https://brevo-tracker-client.onrender.com` |

**brevo-tracker-client:**
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://brevo-tracker-server.onrender.com/api` |

> ⚠️ ต้องกด **Manual Deploy** / **Deploy** ใหม่หลังกรอกตัวแปร เพื่อให้ backend อ่านค่า และ frontend rebuild ฝัง URL ใหม่

---

## 3. เช็คว่าขึ้นสำเร็จ
- เปิด `https://brevo-tracker-server.onrender.com/api/health` → ต้องได้ `{ "ok": true }`
- เปิด `https://brevo-tracker-client.onrender.com` → หน้าแอปโหลดได้

---

## 4. ตั้งค่า Brevo Webhook ชี้มาที่ Backend ที่ Deploy แล้ว
1. Brevo ▸ **Settings ⚙️** ▸ **Webhooks** ▸ **Add a new webhook**
2. Webhook URL = `https://brevo-tracker-server.onrender.com/api/webhooks/brevo`
3. ติ๊ก: ✅ Email opened ✅ Email delivered ✅ Email bounced
4. Save ✅

ตอนนี้พอผู้รับเปิดเมล Brevo จะยิง Webhook มาเก็บที่ DB → Dashboard อัปเดตอัตโนมัติทุก 5 วิ

---

## 🐞 ถ้า Deploy ไม่สำเร็จ ตรวจจุดนี้ก่อน
- **Backend ไม่รัน:** เช็ค Log → ส่วนใหญ่ `MONGODB_URI` ผิด หรือ Atlas ไม่ได้เปิด `0.0.0.0/0`
- **ส่งเมล Error 401:** `BREVO_API_KEY` ผิด หรือ `SENDER_EMAIL` ยังไม่ Verify
- **Frontend โหลดได้แต่เรียก API ไม่ได้ (CORS):** เช็ค `CLIENT_ORIGIN` ใน backend ต้องตรงกับ URL หน้าเว็บพอดี
- **Frontend เรียก API ได้ แต่ URL ผิด:** เช็ค `VITE_API_URL` ใน client ต้องลงท้าย `/api` และ rebuild ใหม่
- **Refresh หน้า /dashboard แล้ว 404:** ตรวจว่า SPA rewrite rule (`/*` → `/index.html`) ทำงาน
