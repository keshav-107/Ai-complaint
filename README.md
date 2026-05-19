# 🛡️ ComplaintAI — AI-Powered Complaint Tracker

> **AI Driven Full Stack Development (AI308B) — ESE Project, 4th Semester**

A full-stack MERN application for registering and tracking public complaints, with Gemini AI integration for intelligent complaint analysis.

---

## 🚀 Features

- **Complaint Registration** — Submit complaints with name, email, title, description, category, and location
- **Complaint Tracking** — View, filter, search, and update all complaints
- **AI Analysis** — Gemini AI detects urgency, recommends department, summarizes, and auto-responds
- **JWT Authentication** — Secure signup/login with bcrypt password hashing
- **Protected Routes** — All complaint APIs require a valid Bearer token

---

## 🗂️ Project Structure

```
complaint_tracker/
├── backend/
│   ├── index.js          # Express server entry point
│   ├── middleware.js     # JWT auth + error handler
│   ├── models/
│   │   └── Complaint.js  # User + Complaint Mongoose schemas
│   └── routes/
│       ├── auth.js       # POST /api/auth/signup|login
│       ├── complaints.js # CRUD + search complaint routes
│       └── ai.js         # POST /api/ai/analyze (Gemini)
└── frontend/
    └── src/
        ├── App.jsx                    # Router + Navbar
        ├── context/AuthContext.jsx    # Global auth state
        ├── services/api.js            # Axios API layer
        └── pages/
            ├── LoginPage.jsx
            ├── SignupPage.jsx
            ├── RegisterComplaint.jsx
            ├── ComplaintList.jsx
            └── ComplaintDetail.jsx
```

---

## ⚙️ Environment Variables

Create `backend/.env`:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/complaintdb
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET_KEY=your_jwt_secret
PORT=5000
```

---

## 🧑‍💻 Running Locally

```bash
# Backend
cd backend
npm install
npm start        # runs on http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev      # runs on http://localhost:5173
```

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Register user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| POST | `/api/complaints` | ✅ | Add complaint |
| GET | `/api/complaints` | ✅ | Get all (filter: ?category=&status=) |
| GET | `/api/complaints/search?location=` | ✅ | Search by location |
| GET | `/api/complaints/:id` | ✅ | Get single complaint |
| PUT | `/api/complaints/:id` | ✅ | Update status |
| DELETE | `/api/complaints/:id` | ✅ | Delete complaint |
| POST | `/api/ai/analyze` | ✅ | Run Gemini AI analysis |

---

## 🤖 AI Features (Gemini 1.5 Flash)

- **Urgency Detection** — Low / Medium / High / Critical
- **Department Recommendation** — Maps complaint type to government department
- **Complaint Summary** — 2-sentence AI summary
- **Auto-Response** — Professional automated reply for the complainant

---

## 🔐 Authentication & Security

- **JWT** — 7-day expiry tokens stored in `localStorage`
- **bcrypt** — Salt rounds: 12
- **Protected Routes** — All complaint & AI endpoints require `Authorization: Bearer <token>`

---

## ☁️ Deployment on Render

### Backend
1. Create a **Web Service** on Render pointing to the `backend/` folder
2. Set environment variables: `MONGO_URI`, `GEMINI_API_KEY`, `JWT_SECRET_KEY`, `PORT`
3. Start command: `node index.js`

### Frontend
1. Create a **Static Site** on Render pointing to the `frontend/` folder
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variable: `VITE_API_URL=https://your-backend.onrender.com`
   - Update `frontend/src/services/api.js` baseURL to `import.meta.env.VITE_API_URL + '/api'`

---

## 🧪 Test Cases

| Test | Expected |
|------|----------|
| Valid signup | 201 + JWT token |
| Duplicate email signup | 409 Conflict |
| Valid login | 200 + JWT token |
| Invalid password | 401 Unauthorized |
| Request without token | 401 Access denied |
| Add complaint (all fields) | 201 stored successfully |
| Add complaint (missing title) | 400 Validation error |
| Invalid email format | 400 Validation error |
| Filter by location | Matching complaints returned |
| Water leakage AI analysis | Water department suggestion |
| Electricity complaint AI | High priority alert |

---

## 👤 Author

**B.Tech 4th Semester** — AI Driven Full Stack Development (AI308B)  
ESE Examination, Even Semester 2025-26
