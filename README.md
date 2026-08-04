# 🎓 Lost & Found — Campus Community Platform

A full-stack platform that helps college students find lost items and reunite owners with what they've found. Users report lost/found items with photos, chat in real time, comment on posts, and receive in-app and email notifications.

![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![Material UI](https://img.shields.io/badge/Material%20UI-6-0081CB?style=flat-square&logo=mui&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?style=flat-square&logo=socketdotio&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black)

---

## ✨ Features

- **Lost / Found posts** — create, edit, and delete posts with multiple photos hosted on Cloudinary
- **Image carousel** — browse multiple photos per post with lazy-loading fallback
- **Global user search** — find people by name from the header and visit their profiles
- **Pagination** — paginated feeds, notifications, and user search to keep the API fast as data grows
- **Comments** — add, edit, and delete comments with author authorization
- **Real-time chat** — WhatsApp-style UI powered by Socket.IO:
  - presence indicators (online / last seen)
  - delivery ticks (sending → sent → delivered → read)
  - typing indicator
  - idempotent sends + REST fallback when the socket is unavailable
- **Notifications** — in-app notification bell + email notifications for comments and messages (Brevo HTTP API with SMTP fallback)
- **Profile management** — avatar upload/removal, hostel info, email & password management
- **Auth** — Firebase Authentication (email/password) with email verification; verified server-side via the Firebase Admin SDK
- **Responsive UI** — Material UI v6, works from mobile to desktop with light/dark mode

## 🛠 Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18, Material UI v6, React Router, Axios, socket.io-client |
| Backend    | Node.js, Express, Socket.IO |
| Database   | MongoDB (Mongoose, Atlas-ready) |
| Auth       | Firebase Authentication + Firebase Admin SDK |
| Media      | Cloudinary |
| Email      | Brevo (Sendinblue) HTTP API with Nodemailer/SMTP fallback |
| Deploy     | Render (single Web Service) |

## 🏗 Architecture

A **single Node.js/Express server** exposes the REST API, hosts Socket.IO for real-time events, and serves the built React app as static files — so one deployable on Render handles the whole app.

- REST API: `/auth`, `/post`, `/chat`, `/notifications`
- Real-time: Socket.IO with connection auth, presence tracking, and chat/notification events
- Auth: client sends `Authorization: Bearer <Firebase ID token>`; the server verifies it via the Firebase Admin SDK and derives the user from the token (never from the request body)

## 📁 Project Structure

```
.
├── server.js                 # Express entrypoint (also serves the client build)
├── firebase.js               # Firebase Admin SDK setup
├── socket.js                 # Socket.IO setup + presence + real-time chat events
├── routes/                   # Express routers (auth, posts, chat, notifications)
├── controllers/              # Request handlers
├── models/                   # Mongoose models (User, Posts, Conversation, Message, Notification)
├── utils/                    # pagination.js, cloudinary.js, emailer.js
└── client/                   # React frontend (create-react-app)
    ├── src/config.js         # API base URL helper (relative in production)
    ├── src/components/       # Reusable UI components
    └── src/services/         # chatService, notificationService, socket client
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Firebase](https://console.firebase.google.com) project (web app + service account)
- A [Cloudinary](https://cloudinary.com) account
- Optional: Brevo API key or SMTP credentials for email notifications

### 1. Backend

```bash
# from the repository root
npm install
cp .env.example .env        # then fill in your credentials
npm run dev                 # starts the API on http://localhost:5000
```

### 2. Frontend (development mode)

```bash
cd client
npm install
cp .env.example .env        # fill in your Firebase web-app keys
npm start                   # dev server on http://localhost:3000
```

In development the client calls `http://localhost:5000` directly (`REACT_APP_BASE_URL` in `client/.env`).

### 3. Production build

```bash
cd client
npm run build               # outputs to client/build
cd ..
npm start                   # Express serves the built app + API on one port
```

The client automatically uses **relative API URLs** when `REACT_APP_BASE_URL` is not set, so one server can serve both the UI and the API on the same origin.

## 🔐 Environment Variables

### Backend — `.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `PORT` | | API port (default `5000`) |
| `FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | ✅ | Firebase service-account client email |
| `FIREBASE_PRIVATE_KEY` | ✅ | Firebase service-account private key |
| `FIREBASE_PRIVATE_KEY_ID` | ✅ | Firebase service-account key ID |
| `FIREBASE_CLIENT_ID` | ✅ | Firebase service-account client ID |
| `FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `FIREBASE_API_KEY` | ✅ | Firebase web API key (used for server-side auth flows) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `BREVO_API_KEY` | | Brevo (Sendinblue) API key — used for email notifications when set |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | | SMTP credentials (fallback when Brevo is not set) |
| `EMAIL_FROM` | | "From" address for emails (optional) |
| `APP_URL` | | Public app URL, used to build links inside notification emails |
| `CLIENT_ORIGIN` | | Allowed origin for Socket.IO CORS (defaults to `*`) |

### Frontend — `client/.env`

| Variable | Description |
|----------|-------------|
| `REACT_APP_BASE_URL` | API base URL for development (`http://localhost:5000`). Leave unset in production to use relative URLs. |
| `REACT_APP_FIREBASE_API_KEY` | Firebase web API key |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase project ID |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `REACT_APP_FIREBASE_APP_ID` | Firebase app ID |

## 🔌 API Overview

Endpoints are mounted directly (no `/api` prefix), e.g. `/auth`, `/post`.

**Authentication:** mutating and user-scoped endpoints require a Firebase ID token sent as `Authorization: Bearer <token>`. The verified user is derived from the token server-side — never from the request body. Public read endpoints (post list, user profiles, search) do not require a token.

**Pagination:** list endpoints accept `?page=<n>&limit=<m>` (max limit `100`) and return `{ docs, total, page, limit, totalPages, hasMore }`. Without those params they return a plain array for backward compatibility.

### Auth (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a user (multipart, optional `profilePhoto`) |
| GET | `/auth/users/search?q=&page=&limit=` | Search users by name (paginated) |
| GET | `/auth/user/:id` | Get a user by ID |
| PUT | `/auth/user/:uid/profile-picture` | Upload avatar (multipart) |
| DELETE | `/auth/user/:uid/profile-picture` | Remove avatar |
| PUT | `/auth/user/:uid/hostel` | Update hostel info |
| POST | `/auth/survey` | Submit onboarding survey |

### Posts (`/post`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/post/?page=&limit=&postType=` | List posts, newest first (paginated, filter by `lost`/`found`) |
| POST | `/post/` | Create a post (multipart `images`, multiple allowed) |
| GET | `/post/user/:uid?page=&limit=` | Posts by a specific user (paginated) |
| GET | `/post/:id` | Post by ID (also used for shared links) |
| PUT | `/post/:id` | Edit post (new `images` + `keepImages` JSON) |
| DELETE | `/post/:id` | Delete a post |
| POST | `/post/:postId/comment` | Add a comment |
| PUT | `/post/:postId/comment/:commentId` | Edit a comment |
| DELETE | `/post/:postId/comment/:commentId` | Delete a comment |

### Chat (`/chat`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat/conversations/:uid` | List a user's conversations |
| GET | `/chat/conversation?userA=&userB=` | Get or create a conversation |
| GET | `/chat/messages/:conversationId` | Get message history |
| POST | `/chat/messages/:conversationId` | Send a message (REST fallback) |
| PUT | `/chat/read/:conversationId` | Mark a conversation as read |

### Notifications (`/notifications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications/:uid?page=&limit=` | Get a user's notifications (paginated) |
| GET | `/notifications/:uid/unread` | Unread count |
| PUT | `/notifications/:uid/read` | Mark all as read |
| PUT | `/notifications/read/:id` | Mark one as read |

## ⚡ Real-time Events (Socket.IO)

Clients authenticate via `auth: { uid }` on connect.

| Direction | Event | Payload |
|-----------|-------|---------|
| Server → client | `presence:init` | `{ onlineUids: string[] }` |
| Server → client | `chat:online` | `{ uid, online }` |
| Server → client | `chat:message` | `{ conversationId, message }` |
| Server → client | `chat:delivered` | `{ conversationId, messageId }` |
| Server → client | `chat:read` | `{ conversationId, readerUid }` |
| Server → client | `chat:typing` | `{ conversationId }` |
| Server → client | `notifications:new` | notification document |
| Client → server | `chat:send` | `{ conversationId, text }` + ack callback |
| Client → server | `chat:join` | `{ conversationId }` |
| Client → server | `chat:typing` | `{ conversationId }` |

## ☁️ Deploying to Render

The project is designed to run as a **single Render Web Service**: the Express server serves the REST API, Socket.IO, and the compiled React app from one origin — no separate static host or reverse proxy needed.

### Option A — One-click with the Render Blueprint (recommended)

A [`render.yaml`](render.yaml) blueprint is included. After pushing this repo to GitHub:

1. In Render: **New → Blueprint** and connect the repository.
2. Render auto-detects `render.yaml`, creates the web service, and provisions a `MONGODB_URI` secret.
3. Fill in the remaining secrets (`sync: false` values) in **Service → Environment**, then **Deploy**.

### Option B — Manual Web Service

1. Push the repository to GitHub.
2. In the Render dashboard: **New → Web Service** → connect the repo.
3. Set the runtime to **Node** and configure:
   - **Build Command**
     ```bash
     npm install && npm install --prefix client && npm run build --prefix client
     ```
   - **Start Command**
     ```bash
     node server.js
     ```
4. Add all environment variables from the backend table above. Use **secret values** for API keys. Set `APP_URL` to your deployed URL (e.g. `https://lost-found.onrender.com`).

### Post-deploy configuration

1. **MongoDB** — create a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, allow Render's IP range, and set the connection string as `MONGODB_URI`.
2. **Firebase** — in the **Firebase Console → Authentication → Settings → Authorized domains**, add your Render URL (required for sign-in). The Firebase **service-account key** variables must match the backend table exactly.
3. **`REACT_APP_FIREBASE_*` variables** — create-react-app inlines these into the JS bundle at build time, so they must be present when the **Build Command** runs. Render exposes service environment variables to builds automatically.
4. **`FIREBASE_PRIVATE_KEY`** — paste the full key. Render preserves its newlines; `firebase.js` also handles the escaped `\n` form, so either format works.

### Notes on `.env` and Render

`.env` is gitignored and **never uploaded to GitHub or Render**. `dotenv.config()` in `server.js` only reads `.env` if the file exists and never overrides an already-set environment variable — so on Render the dashboard values take over and no `.env` file is needed.

### Free tier considerations

> Render's free tier sleeps after ~15 minutes of inactivity, so the first request after idle is slow. Keep the service warm with a scheduled uptime ping (e.g. UptimeRobot, cron job) or upgrade to a paid instance. When the database is on Atlas free tier, add the `ping=true` and `retryWrites=true` options to the connection string.

## 📄 License

ISC
