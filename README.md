# 🏨 Bookin Hub

A **multi-vendor hotel and venue booking marketplace** — users discover hotels, book rooms or time slots, and pay via Razorpay. Built with async job queues (BullMQ), Redis caching, Role-Based Access Control (RBAC), and email/SMS notifications.

---

## 🛠️ Tech Stack

| Backend | Frontend | Infrastructure |
|---------|----------|---------------|
| Node.js + Express | React.js (Vite) | MongoDB (Mongoose) |
| Mongoose ODM | Tailwind CSS | Redis (cache + BullMQ) |
| BullMQ (job queues) | React Router DOM | Cloudinary (Images)|
| Razorpay (payments) | Axios | - |
| Twilio (SMS OTP) | Material UI / Mantine | - |
| Nodemailer (email) | Framer Motion & Lottie | - |

---

## 🏗️ Architecture

```text
┌──────────────┐
│ React (:5173)│
└──────┬───────┘
       │ Axios
       ▼
┌──────────────┐          ┌──────────────────┐
│Express(:8000)│◄───────  │    Redis         │
└──────┬───────┘          │  ┌────────────┐  │
       │                  │  │Hotel Cache │  │
       ▼                  │  │ (TTL 120s) │  │
┌──────────────┐          │  ├────────────┤  │
│    MongoDB   │          │  │ BullMQ     │  │
│(via Mongoose)│          │  │ Backend    │  │
└──────────────┘          │  └────────────┘  │
                          └──────────────────┘
                                   │
                          ┌────────┴────────┐
                          ▼                 ▼
                   ┌────────────┐  ┌──────────────┐
                   │  Payment   │  │ Notification │
                   │  Worker    │  │   Worker     │
                   └────────────┘  └──────┬───────┘
                                          ▼
                                   ┌──────────────┐
                                   │  Nodemailer  │
                                   │ (Email / SMS)│
                                   └──────────────┘
```

---

## ⚙️ How It Works

### Booking Lifecycle

```
CART → PENDING_PAYMENT (slot/room locked, 15min expiry)
         ├── Payment success → CONFIRMED
         ├── Timeout → CART (slot/room freed)
         └── User cancels → CART
CONFIRMED → User cancels → CANCELLED
CONFIRMED → Event/Stay passes → COMPLETED
```

### Payment Webhook Flow (Async via BullMQ)

```
Razorpay webhook → API verifies HMAC → enqueues job → returns 200 OK (instant)
                         ↓
                Payment Worker (idempotent)
                         ↓
                Updates DB (transaction) + enqueues notification
                         ↓
                Notification Worker → Nodemailer email / Twilio SMS (or console mock)
```

### Hotel/Venue Cache Flow

```
API call → Redis check?
  ├── Hit → return cached JSON (TTL 120s)
  └── Miss → Mongoose → MongoDB → populate cache → return JSON
```

---

## ✨ Features

### 👤 Users
- OTP login via Twilio SMS
- Browse hotels and venues (Redis-cached) with photo galleries (Cloudinary)
- Book venues/rooms with real-time availability calendar
- Pay via Razorpay (cards, UPI, netbanking)
- Wishlist management
- Booking history & cancellation
- Email/SMS notifications on confirm/cancel

### 🏢 Providers (Hosts/Hoteliers)
- KYC onboarding with approval workflow
- Hotel/Venue CRUD (photos, types, features, pricing)
- Service listing management
- Booking dashboard & revenue insights

### 🛡️ Admin
- Provider/venue/service approval
- RBAC with granular table+operation permissions
- User-role assignment & action logs

### ⚡ Background Jobs
- **BullMQ**: Payment processing + email notifications run asynchronously
- **Redis caching**: Hotel/Venue listing/detail endpoints cached with 120s TTL
- **Idempotent webhooks**: Duplicate Razorpay webhooks safely skipped
- **Graceful degradation**: Redis down → DB fallback

---

## 📁 Folder Structure

```
backend/
├── package.json
└── src/
    ├── app.js                   # Express app setup
    ├── server.js                # Server entry point
    ├── config/                  # Environment configurations
    ├── constants/               # Application constants
    ├── middleware/              # Auth, RBAC, validation, logging
    ├── modules/                 # Feature modules (auth, booking, etc.)
    ├── queues/                  # BullMQ queues
    ├── services/                # Reusable business logic
    ├── shared/                  # Shared utilities/helpers
    ├── utils/                   # General helper functions
    ├── validators/              # Request payload validation
    └── workers/                 # BullMQ workers (Payment, Notifications)

frontend/
├── package.json
└── src/
    ├── App.jsx                  # Main App component
    ├── main.jsx                 # React DOM entry point
    ├── Components/              # Reusable UI elements
    ├── Pages/                   # React Router pages
    ├── assets/                  # Static assets (images, icons)
    └── index.css                # Tailwind & global styles
```

---

## 📖 API Overview (Example Endpoints)

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Create account |
| POST | `/api/v1/auth/otp` | Send OTP via Twilio |
| POST | `/api/v1/auth/otp/verify` | Verify OTP & login |
| GET | `/api/v1/auth/me` | Current user profile |

### Hotels & Venues (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/venues` | List venues/hotels (cached) |
| GET | `/api/v1/venues/:venueId` | Venue details (cached) |
| GET | `/api/v1/venues/:venueId/availability` | Slot/Room availability |

### Booking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/book/venues/:venueId` | Create booking |
| GET | `/api/v1/book/booking/:bookingId` | Booking details |
| DELETE | `/api/v1/book/booking/:bookingId` | Cancel booking |
| GET | `/api/v1/book/my-bookings` | User bookings |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payment/create-order` | Create Razorpay order |
| POST | `/api/v1/payment/verify-payment` | Verify payment |
| POST | `/api/v1/payment/webhook` | Razorpay webhook → enqueues job |

### Wishlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/wishlist/my-wishlist` | View user wishlist |
| POST | `/api/v1/wishlist/venues/:venueId/toggle` | Toggle wishlist |

---

## 🔐 Environment Variables

```env
# Backend (.env)
PORT=8000
FRONTEND_URL=http://localhost:5173

# Database
MONGO_URI=mongodb://localhost:27017/bookin-hub

# Auth
JWT_SECRET=your-secret-key

# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Nodemailer (Email)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Redis / BullMQ
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cloudinary (Images)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 🚀 Getting Started

```bash
# Prerequisites: Node.js 20+, MongoDB, Redis, Docker (optional)

# Terminal 1 — Start Redis & MongoDB (via Docker, if preferred)
docker compose up -d

# Terminal 2 — Backend API
cd backend
npm install
npm run dev                    # localhost:8000

# Terminal 3 — Frontend
cd frontend
npm install
npm run dev                    # localhost:5173
```
