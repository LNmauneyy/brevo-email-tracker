# 📧 Brevo Email Tracker

ระบบส่งอีเมลผ่าน **Brevo API** พร้อม **Dashboard ติดตามการเปิดอ่านแบบ Real-time** ด้วย Webhook

---

## 🧱 โครงสร้างระบบ (Architecture)

```
┌─────────────┐     POST /api/emails/send     ┌──────────────────┐
│  React UI   │ ───────────────────────────▶ │  Express Backend │
│ (Tailwind)  │                               │                  │
│             │ ◀── GET /api/stats/* ──────── │  • สร้าง EmailLog│
└─────────────┘                               │  • เรียก Brevo   │
                                              └────────┬─────────┘
                                                       │ sendTransacEmail
                                                       │ (แนบ tag = _id)
                                                       ▼
                                              ┌──────────────────┐
                                              │   Brevo (SMTP)   │
                                              └────────┬─────────┘
                                                       │ ผู้รับเปิดอีเมล
                                                       │ (Event: opened/delivered)
                                                       ▼
                                       POST /api/webhooks/brevo
                                              ┌──────────────────┐
                                              │  Express Backend │
                                              │  อัปเดต EmailLog │
                                              │  ตาม tag ที่จับคู่│
                                              └────────┬─────────┘
                                                       ▼
                                              ┌──────────────────┐
                                              │     MongoDB      │
                                              │   (Mongoose)     │
                                              └──────────────────┘
```

### 🔑 หัวใจของระบบ: การจับคู่ Webhook กับ DB
1. ตอนส่งเมล เราสร้าง Document `EmailLog` ใน MongoDB **ก่อน** เรียก Brevo
2. เอา `_id` ของ Document นั้นมาเป็น `tag` แล้วแนบไปกับอีเมล (`sendSmtp.tags = [log.tag]`)
3. เมื่อผู้รับเปิดอีเมล Brevo จะยิง Webhook กลับมาพร้อม `tags: ["<_id>"]`
4. Backend ใช้ `tag` นี้หา Document เดิม (`findOneAndUpdate({ tag })`) แล้วอัปเดตสถานะเป็น `opened` + เวลาเปิดอ่าน
5. Dashboard ดึงข้อมูลจาก DB มาโชว์ และรีเฟรชทุก 5 วินาที → ได้ความรู้สึก Real-time

---

## 📁 โครงสร้างโฟลเดอร์

```
brevo-email-tracker/
├── server/                      # Backend (Node.js / Express)
│   ├── .env.example             # ตัวอย่าง Environment Variables
│   ├── package.json
│   └── src/
│       ├── index.js             # จุดเริ่มต้นรัน Server
│       ├── app.js               # ตั้งค่า Express + Routes
│       ├── db.js                # เชื่อมต่อ MongoDB
│       ├── config/brevo.js      # Brevo API Client
│       ├── models/EmailLog.js   # Mongoose Schema
│       ├── middleware/validate.js # ตรวจสอบอีเมล
│       ├── controllers/
│       │   ├── emailController.js    # ส่งเมล
│       │   ├── webhookController.js  # รับ Webhook
│       │   └── statsController.js    # สถิติ + รายชื่อ
│       └── routes/              # เส้นทาง API
│
└── client/                      # Frontend (React + Vite + Tailwind)
    ├── package.json
    ├── vite.config.js           # Dev Proxy → Backend
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx, App.jsx, index.css, api.js
        ├── pages/
        │   ├── SendEmail.jsx    # ฟอร์มส่งเมล
        │   └── Dashboard.jsx    # หน้า Dashboard
        └── components/
            ├── StatCard.jsx     # การ์ดสรุปตัวเลข
            └── RecipientsTable.jsx # ตารางรายชื่อผู้รับ
```

---

## 🚀 วิธีรัน (Local)

### 1) Backend
```bash
cd server
cp .env.example .env        # แล้วแก้ค่าให้ครบ (ดูด้านล่าง)
npm install
npm run dev                 # รันที่ http://localhost:5000
```

### 2) Frontend (เปิด Terminal ใหม่)
```bash
cd client
npm install
npm run dev                 # รันที่ http://localhost:5173
```

เปิด浏览器ที่ `http://localhost:5173` แล้วทดสอบส่งเมล และดู Dashboard

### ตัวแปรใน `.env` (server)
| ตัวแปร | คำอธิบาย |
|--------|-----------|
| `PORT` | พอร์ต Backend (ค่าตั้งต้น 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `BREVO_API_KEY` | API Key จาก Brevo (ดูข้อ 4) |
| `SENDER_EMAIL` | อีเมลผู้ส่ง **ต้อง Verify แล้วใน Brevo** |
| `SENDER_NAME` | ชื่อที่แสดงตอนส่ง |
| `CLIENT_ORIGIN` | URL ของ Frontend (สำหรับ CORS) |

> ⚠️ **สำคัญ:** `SENDER_EMAIL` ต้องเป็นอีเมลที่เพิ่มและ Verify แล้วใน Brevo > **Senders, Domains & Dedicated IPs** มิฉะนั้นจะส่งเมลไม่ได้

---

## 🔔 วิธีตั้งค่า Webhook ในหน้าเว็บ Brevo

ให้ Brevo ยิง Event กลับมาที่ Server ของเรา ทำตามนี้:

1. เข้าสู่ระบบ **Brevo** → ไปที่ **Settings (การตั้งค่า) ⚙️** (มุมขวาบน)
2. เลือกเมนู **Webhooks** (อยู่ในหมวด "Your Keys & Webhooks" หรือ "SMTP & API")
3. กดปุ่ม **Add a new webhook** (หรือ "Create a webhook")
4. กรอก **Webhook URL** ด้วย endpoint ของเรา:
   - ถ้ารันทดสอบในเครื่อง ต้องใช้ Tunnel สาธารณะ (เช่น **ngrok**):
     ```bash
     # เปิด ngrok ชี้ไปพอร์ต 5000
     ngrok http 5000
     ```
     แล้วเอา URL ที่ได้มาเช่น `https://abcd.ngrok-free.app` มาต่อท้าย:
     ```
     https://abcd.ngrok-free.app/api/webhooks/brevo
     ```
   - ถ้า deploy จริง ใส่ `https://domain-ของคุณ/api/webhooks/brevo`
5. เลือก **Event** ที่ต้องการให้ Brevo แจ้ง (ติ๊กถูก):
   - ✅ `Email opened` (เปิดอ่าน)  → ตรงกับ Event `opened`
   - ✅ `Email delivered` (ส่งสำเร็จ) → ตรงกับ Event `delivered`
   - ✅ `Email bounced` (ตีกลับ) → ตรงกับ Event `bounce` ( bonus )
6. (แนะนำ) ตั้ง **Webhook Secret** แล้วนำมาเก็บใน `.env` ฝั่ง Backend เพื่อตรวจสอบความน่าเชื่อถือของ Request
7. กด **Save / Create** ✅

> 💡 Brevo มี Open Tracking ในตัว — พอผู้รับเปิดเมล Brevo จะฝัง Tracking Pixel ให้อัตโนมัติและยิง Webhook `opened` มาเอง เราไม่ต้องทำ Pixel เอง

---

## 📡 รายการ API Endpoints

| Method | Path | ทำหน้าที่ |
|--------|------|-----------|
| POST | `/api/emails/send` | ส่งอีเมล (body: `{ recipients, subject, htmlContent }`) |
| POST | `/api/webhooks/brevo` | รับ Event จาก Brevo (opened/delivered/bounce) |
| GET  | `/api/stats/summary` | สถิติรวม (total/delivered/opened/openRate) |
| GET  | `/api/stats/recipients?status=&page=&limit=` | รายชื่อผู้รับแบ่งหน้า |

---

## 🧪 ทดสอบ Webhook ท้องถิ่นแบบเร็ว
```bash
# ยิงจำลอง Event 'opened' มาเอง (แทนค่า <tag> ด้วย _id จริงจาก DB)
curl -X POST http://localhost:5000/api/webhooks/brevo \
  -H "Content-Type: application/json" \
  -d '{"event":"opened","email":"test@test.com","tags":["<tag>"],"ts":1752145800}'
```
แล้วดูที่ Dashboard ว่าสถานะเปลี่ยนเป็น "เปิดแล้ว" ทันที
