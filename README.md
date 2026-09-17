# Onefeed

Internal marketing platform. A single prompt, sent from a dashboard chat
panel, is turned into a blog post, images, a video, and a WhatsApp message.
All of the generation logic lives in n8n — this project is just the
interface and a thin backend that forwards requests to n8n webhooks.

## Project structure

```
onefeed-project/
├── frontend/     React app (Vite, component-based)
└── backend/      Express app — routes + controllers only, no database
```

The two folders are independent. Each has its own `package.json` and its
own `.env` file, and they run as two separate processes in development.

### Frontend structure

```
frontend/src/
├── components/
│   ├── layout/        Navbar, Footer, MarketingLayout
│   ├── dashboard/      Sidebar, ChatPanel
│   └── ui/             (reserved for shared UI pieces)
├── pages/
│   ├── Home.jsx
│   ├── About.jsx
│   ├── PrivacyPolicy.jsx
│   ├── TermsAndConditions.jsx
│   ├── Dashboard.jsx           dashboard layout (topbar + sidebar + outlet)
│   └── dashboard/
│       ├── BlogPage.jsx        placeholder, empty for now
│       ├── ImagePage.jsx       placeholder, empty for now
│       ├── VideoPage.jsx       placeholder, empty for now
│       └── WhatsappPage.jsx    placeholder, empty for now
├── lib/api.js          axios instance + sendChatMessage()
├── styles/theme.css     the Neo-Brutalist Pop design system
└── App.jsx              all routes are defined here
```

### Backend structure

```
backend/src/
├── config/env.js              reads and exposes environment variables
├── controllers/                one controller per webhook (chat, blog, image, video, whatsapp)
├── routes/                     one route file per controller, combined in routes/index.js
├── middleware/errorHandler.js
└── server.js                   Express app entry point
```

Every controller does the same thing: it receives the request from the
frontend and forwards it, unchanged, to the matching n8n webhook URL from
the environment variables, then returns n8n's response back to the
frontend. There is no business logic on the backend and no database — n8n
owns all of that.

## Routes (frontend pages)

| Path                       | Page                                    |
|----------------------------|------------------------------------------|
| `/`                        | Home — platform info                     |
| `/about`                   | About                                     |
| `/privacy-policy`          | Privacy Policy (placeholder text)        |
| `/terms-and-conditions`    | Terms & Conditions (placeholder text)    |
| `/dashboard`               | Dashboard — chat panel                   |
| `/dashboard/blog`          | Blog section (empty for now)             |
| `/dashboard/image`         | Image section (empty for now)            |
| `/dashboard/video`         | Video section (empty for now)            |
| `/dashboard/whatsapp`      | WhatsApp section (empty for now)         |

The sidebar inside `/dashboard` can be opened and closed with the toggle
button in the top bar, and it lists the four sections above.

## Prerequisites

- Node.js 18 or newer (Node 20 LTS recommended)
- npm (comes with Node)
- Access to your n8n instance and its webhook URLs

You do not need a database. You do not need to run anything else locally
besides the two apps below.

## 1. Install dependencies

From inside each folder, install its own dependencies:

```bash
cd frontend
npm install
```

```bash
cd backend
npm install
```

## 2. Set up environment variables

Both apps read configuration from a `.env` file. Example files are
provided — copy them and fill in real values.

**Backend** — copy `backend/.env.example` to `backend/.env`:

```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env`:

```
PORT=5000

N8N_WEBHOOK_CHAT_URL=https://your-n8n-instance.com/webhook/chat
N8N_WEBHOOK_BLOG_URL=https://your-n8n-instance.com/webhook/blog
N8N_WEBHOOK_IMAGE_URL=https://your-n8n-instance.com/webhook/image
N8N_WEBHOOK_VIDEO_URL=https://your-n8n-instance.com/webhook/video
N8N_WEBHOOK_WHATSAPP_URL=https://your-n8n-instance.com/webhook/whatsapp

# Placeholder for later — no database is connected yet.
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Only `N8N_WEBHOOK_CHAT_URL` is required for the dashboard chat panel to
work today. The blog/image/video/whatsapp webhook variables and
controllers are already wired up and ready for when those pages get built
out.

**Frontend** — copy `frontend/.env.example` to `frontend/.env`:

```bash
cd frontend
cp .env.example .env
```

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Change this if the backend runs on a different host or port (for example,
once it is deployed).

## 3. Run both apps in development

In one terminal:

```bash
cd backend
npm run dev
```

This starts the backend on `http://localhost:5000` (or whatever `PORT`
you set).

In a second terminal:

```bash
cd frontend
npm run dev
```

This starts the frontend on `http://localhost:5173`. Open that address in
your browser.

## 4. Build for production

Frontend:

```bash
cd frontend
npm run build
```

This produces a static build in `frontend/dist`, which can be deployed to
any static host.

Backend:

```bash
cd backend
npm start
```

This runs the Express server directly with Node (no build step needed for
the backend).

## How the chat panel talks to n8n

1. The dashboard chat panel (`ChatPanel.jsx`) sends the typed message to
   the backend at `POST /api/chat`.
2. The backend's `chat.controller.js` forwards that request, as-is, to
   `N8N_WEBHOOK_CHAT_URL`.
3. Whatever n8n returns is sent straight back to the frontend and shown in
   the chat. The frontend expects a `reply` field in the response (for
   example `{ "reply": "..." }`) — adjust the n8n workflow's response
   shape, or adjust `ChatPanel.jsx`, so the two match.

The blog, image, video and WhatsApp routes/controllers follow the exact
same forwarding pattern and are ready to be called once those dashboard
pages are built out.

## Design

The whole interface uses one design system: **Neo-Brutalist Pop** — solid
colours, black borders, hard drop shadows, no gradients. Every colour has a
fixed meaning throughout the app:

- Blue — Video
- Yellow — Blog
- Red — Image
- Lime — WhatsApp

The design tokens (colours, shadows, border radius) live at the top of
`frontend/src/styles/theme.css` as CSS variables, so the whole look can be
adjusted from one place.
