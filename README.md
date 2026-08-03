# 🎓 Lost & Found — Campus Community Platform

A full-stack web app for college campuses to help people find lost items and reunite owners with what they've found. Users post found/lost items with photos, chat in real time, comment on posts, and get notified — in-app and by email.

## ✨ Features

- **Lost / Found posts** — create, edit, and delete posts with multiple photos (uploaded to Cloudinary)
- **Image carousel** — browse multiple photos per post; see recently added posts
- **Global user search** — find people by name from the header and visit their profiles
- **Comments** — add, edit, and delete comments on posts
- **Real-time chat** — WhatsApp-style UI with:
  - presence indicators (online / last seen)
  - delivery ticks (sending → sent → delivered → read)
  - typing indicator
  - REST fallback when the socket is unavailable
- **Notifications** — in-app notification bell + email notifications for comments and messages (Nodemailer / SMTP)
- **Profile management** — avatar upload/removal, hostel info, email & password management
- **Auth** — Firebase Authentication (email/password) with email verification; verified server-side via Firebase Admin SDK
- **Responsive UI** — Material UI, works from mobile to desktop

## 🛠 Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18, Material UI v6, React Router, Axios, socket.io-client |
| Backend    | Node.js, Express, Socket.IO |
| Database   | MongoDB (Mongoose, Atlas-ready) |
| Auth       | Firebase Auth + Firebase Admin SDK |
| Media      | Cloudinary |
| Email      | Nodemailer (SMTP) |

## 📁 Project Structure

```
.
├── server.js                 # Express entrypoint (also serves the client build)
├── firebase.js               # Firebase Admin SDK setup
├── socket.js                 # Socket.IO setup + presence + real-time chat events
├── routes/                   # Express routers (auth, posts, chat, notifications)
├── controllers/              # Request handlers
├── models/                   # Mongoose models (User, Posts, Conversation, Message, Notification)
├── utils/                    # cloudinary.js, emailer.js
└── client/                   # React frontend (create-react-app)
    ├── src/config.js         # API base URL helper (relative in production)
    ├── src/components/       # UI components
    └── src/services/         # chatService, notificationService, socket client
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- A [Firebase](https://console.firebase.google.com) project (web app + service account)
- A [Cloudinary](https://cloudinary.com) account
- (Optional) SMTP credentials for email notifications

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

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `PORT` | API port (default `5000`) |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase service-account client email |
| `FIREBASE_PRIVATE_KEY` | Firebase service-account private key |
| `FIREBASE_PRIVATE_KEY_ID` | Firebase service-account key ID |
| `FIREBASE_CLIENT_ID` | Firebase service-account client ID |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `FIREBASE_API_KEY` | Firebase web API key (used for server-side auth flows) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | SMTP credentials for email notifications (optional) |
| `EMAIL_FROM` | "From" address for emails (optional) |
| `APP_URL` | Public app URL (used to build links inside notification emails) |
| `CLIENT_ORIGIN` | Allowed origin for Socket.IO CORS (defaults to `*`) |

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

Base path `/api` is not used — endpoints are mounted directly (e.g. `/auth`, `/post`).

### Auth (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a user (multipart, optional `profilePhoto`) |
| GET | `/auth/users/search?q=` | Search users by name |
| GET | `/auth/user/:id` | Get a user by ID |
| PUT | `/auth/user/:uid/profile-picture` | Upload avatar (multipart) |
| DELETE | `/auth/user/:uid/profile-picture` | Remove avatar |
| PUT | `/auth/user/:uid/hostel` | Update hostel info |
| POST | `/auth/survey` | Submit onboarding survey |

### Posts (`/post`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/post/` | List all posts |
| POST | `/post/` | Create a post (multipart `images`, multiple allowed) |
| GET | `/post/user/:uid` | Posts by a specific user |
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
| GET | `/notifications/:uid` | Get a user's notifications |
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
| Client → server | `chat:send` | `{ conversationId, text }` + ack callback |
| Client → server | `chat:join` | `{ conversationId }` |
| Client → server | `chat:typing` | `{ conversationId }` |

## ☁️ Deploying to Render

The repo is designed to run as a **single Render Web Service** (the Express server serves both the API and the built React app).

1. Push the repository to GitHub.
2. In the Render dashboard: **New → Web Service** → connect the repo.
3. Configure:
   - **Build Command:** `npm install && npm install --prefix client && npm run build --prefix client`
   - **Start Command:** `node server.js`
4. Add the backend environment variables from the table above (all the `FIREBASE_*`, `CLOUDINARY_*`, `MONGODB_URI`, SMTP if desired, and `APP_URL` set to your deployed URL, e.g. `https://lost-found.onrender.com`).
5. In the **Firebase Console → Authentication → Settings → Authorized domains**, add your Render URL (required for sign-in).
6. Deploy and open the URL.

### Handling `.env` on Render

`.env` is gitignored and **never uploaded to GitHub or Render**. Instead, the same variables are stored inside the Render service:

- **Service → Environment** → add every variable from your local `.env` (same names, same values). Render encrypts secret values and injects them as real environment variables for both the **build** and **runtime** steps.
- `dotenv.config()` in `server.js` only reads the `.env` file if it exists — it never overrides an environment variable that's already set — so on Render the dashboard values simply take over and no `.env` file is needed.
- Also add the **`REACT_APP_FIREBASE_*`** variables: create-react-app inlines these into the JS bundle during the build, so they must be present when the `npm run build` step runs (Render exposes service env vars to builds too).
- `FIREBASE_PRIVATE_KEY`: paste the full key. Render preserves its newlines, and `firebase.js` additionally handles the escaped `\n` form, so either copy works.

> **Note:** Render's free tier sleeps after ~15 minutes of inactivity, so the first request after idle will be slow. Use a periodic uptime ping or a paid instance to keep it warm.

## 📄 License

ISC
