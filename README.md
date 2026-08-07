# 🏨 Bookin Hub

A **multi-vendor hotel booking marketplace** — users discover hotels, book rooms, and pay via Razorpay. Built with async job queues (BullMQ), Redis caching, Role-Based Access Control (RBAC), and email/SMS notifications.

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
│  (via atlas) │          │  │ Backend    │  │
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
                                   ┌─────────────────────┐
                                   │  Nodemailer(Email)/ │
                                   │   (Twilio SMS OTP)  │
                                   └─────────────────────┘
```

---

## ⚙️ How It Works

### Booking Lifecycle

```
CART → PENDING_PAYMENT (slot/room locked, 5min expiry)
         ├── Payment success → CONFIRMED
         ├── Timeout → Booking slot/room freed
         └── User cancels → Booking Slot
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

### Hotel Cache Flow

```
API call → Redis check?
  ├── Hit → return cached JSON (TTL 120s)
  └── Miss → Mongoose → MongoDB → populate cache → return JSON
```

---

## ✨ Features

### 👤 Users
- OTP Register via Twilio SMS
- Login via JWT Auth
- Browse hotels (Redis-cached) with photo galleries (Cloudinary)
- Book rooms with real-time availability calendar
- Pay via Razorpay (cards, UPI, netbanking)
- Booking history & cancellation
- Email/SMS notifications on confirm/cancel/refund

### 🏢 Providers (Hosts/Hoteliers)
- KYC onboarding with approval workflow
- Hotel/Room CRUD (photos, types, features, pricing)
- Booking dashboard & revenue insights

### 🛡️ Admin
- **Hotel Owner Management**: Approve/reject KYC and onboarding for hoteliers
- **Hotel Management**: Approve, reject, and block/unblock hotel listings
- **Refund Processing**: View pending/completed refunds and process cancellations

### ⚡ Background Jobs
- **BullMQ**: Payment processing + email notifications run asynchronously
- **Redis caching**: Hotel listing/detail endpoints cached with 120s TTL
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
├── vite.config.js               # Vite bundler configuration
└── src/
    ├── App.jsx                  # Main App component & Router logic
    ├── main.jsx                 # React DOM entry point
    ├── Components/              # Shared UI elements (Navbar, Footer, etc.)
    ├── Pages/                   # Application views
    │   ├── Main/                # End-user pages (Search, Booking, Profile)
    │   ├── Hotel/               # Hotel Owner dashboard (CRUD rooms/hotels)
    │   └── Super/               # Admin dashboard (Approvals & Management)
    ├── assets/                  # Static assets (images, icons)
    └── index.css                # Tailwind CSS imports & global variables
```

---

## 📖 API Overview (Core Endpoints)

### Users (`/api/user`)
| Method |    Endpoint   | Description          |
|--------|---------------|----------------------|
| POST   | `/register`   | Register user        |
| POST   | `/login`      | User login           |
| POST   | `/verify-otp` | Verify OTP           |

### Hotel Owners (`/api/hotel/owner`)
| Method |   Endpoint   | Description          |
|--------|--------------|----------------------|
| POST   | `/register`  | Register hotel owner |
| POST   | `/login`     | Owner login          |
| GET    | `/profile`   | Get owner profile    |

### Hotels & Rooms (`/api/hotel`)
| Method |   Endpoint        |       Description          |
|--------|-------------------|----------------------------|
| GET    | `/search`         | Search hotels (cached)     |
| GET    | `/:id`            | Hotel details (cached)     |
| POST   | `/create`         | Create hotel (Owner)       |
| POST   | `/room/create`    | Add rooms to hotel (Owner) |

### Bookings (`/api/booking`)
| Method |  Endpoint |   Description          |
|--------|-----------|------------------------|
| POST   | `/`       |   Create booking       |
| GET    | `/hotel`  |   User's bookings      |
| POST   | `/cancel` |   Cancel booking       |

### Payments (`/payment`)
| Method |      Endpoint     |           Description           |
|--------|-------------------|---------------------------------|
| POST   | `/create-order`   | Create Razorpay order           |
| POST   | `/verify-payment` | Verify payment                  |
| POST   | `/webhook`        | Razorpay webhook → enqueues job |

### Reviews (`/api/hotel-ratings`)
| Method |    Endpoint    | Description           |
|--------|----------------|-----------------------|
| POST   | `/submit`      | Submit rating         |
| GET    | `/:hotelId`    | Get hotel ratings     |

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
