# Pahore Academy Mianwali — Complete Setup & Deployment Guide

## What's Inside the ZIP

```
pahore-academy/
├── app/                        ← All pages (Next.js App Router)
│   ├── page.tsx                ← Landing page
│   ├── auth/login              ← Login
│   ├── auth/register           ← Register
│   ├── auth/select-role        ← Role picker
│   ├── onboarding/student      ← Student onboarding
│   ├── onboarding/teacher      ← Teacher code gate
│   ├── onboarding/admin        ← Admin code gate
│   ├── dashboard/student/      ← Student: home, marks, profile, library, AI, notifications
│   ├── dashboard/teacher/      ← Teacher: home, marks entry, roster, reports, library, AI calc
│   ├── dashboard/admin/        ← Admin: home, students DB, users, analytics, codes, export
│   └── api/                    ← API routes (AI, marks, students, library)
├── components/layout/          ← Sidebar, Topbar, DashboardLayout
├── lib/                        ← supabase.ts, claude.ts, utils.ts
├── store/                      ← Zustand global state
├── hooks/                      ← useAuth, useMarks
├── types/index.ts              ← All TypeScript types
├── supabase-schema.sql         ← Complete database schema (run this first)
├── tailwind.config.ts          ← Full design system
├── package.json                ← All dependencies
└── .env.local.example          ← Environment variables template
```

---

## STEP 1 — Supabase (Database + Auth + Storage)

**Time: ~5 minutes**

1. Go to **https://supabase.com** → Sign up free → **New project**
2. Choose a name (e.g. `pahore-academy`), set a strong DB password, pick the closest region
3. Wait ~2 minutes for project to spin up
4. Go to **SQL Editor** (left sidebar)
5. Click **New Query** → paste the entire contents of `supabase-schema.sql` → click **Run**
6. You should see: "Success. No rows returned"

**Get your keys:**
- Go to **Settings → API**
- Copy: `Project URL`, `anon public key`, `service_role key` (keep this secret)

**Storage bucket:**
- Go to **Storage** → you should see a `library` bucket (created by the SQL)
- If not: click **New Bucket** → name it `library` → check **Public** → Create

---

## STEP 2 — Get Your Anthropic API Key (for AI features)

**Time: 2 minutes**

1. Go to **https://console.anthropic.com**
2. Sign up / log in → **API Keys** → **Create Key**
3. Copy the key (starts with `sk-ant-...`)

> Free tier gives you enough credits to test everything.

---

## STEP 3 — Run Locally on Your Computer

**Requirements:** Node.js 18+ installed (download from nodejs.org)

```bash
# 1. Unzip the downloaded file
unzip pahore-academy.zip
cd academy-platform

# 2. Install dependencies (takes 1-2 min first time)
npm install

# 3. Create your environment file
cp .env.local.example .env.local

# 4. Open .env.local and fill in your keys:
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ANTHROPIC_API_KEY=sk-ant-api03-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ACADEMY_NAME=Pahore Academy Mianwali
```

```bash
# 5. Start the development server
npm run dev

# 6. Open your browser
# → http://localhost:3000
```

**That's it — the site is running locally!**

---

## STEP 4 — Deploy Live to the Internet (Free)

### Option A: Vercel (Recommended — easiest, fastest)

**Time: 3 minutes**

1. Go to **https://github.com** → Sign up free → **New repository**
2. Name it `pahore-academy` → Create
3. Upload all files from the unzipped folder (drag & drop or use GitHub Desktop)
4. Go to **https://vercel.com** → Sign up with GitHub
5. Click **New Project** → Import your `pahore-academy` repo
6. In **Environment Variables**, add all 5 variables from your `.env.local`
7. Click **Deploy**

Vercel gives you a free URL like:
```
https://pahore-academy.vercel.app
```

**Your site is live!**

---

### Option B: Netlify (Alternative)

1. Go to **https://netlify.com** → Sign up
2. Drag and drop the project folder onto the Netlify dashboard
3. Go to **Site Settings → Environment Variables** → add all 5 keys
4. Trigger a new deploy

---

## Default Access Codes

When teachers or admins sign up, they need these codes:

| Role    | Default Code       |
|---------|--------------------|
| Teacher | `TCH-2024-ACAD`    |
| Admin   | `ADM-ROOT-001`     |

**Change these immediately after first login** — go to Admin Dashboard → Access Codes.

---

## First Time Setup After Deployment

1. Go to your live URL
2. Click **Get Started** → Register with any email
3. Select **Admin** → enter code `ADM-ROOT-001`
4. You're in the admin dashboard
5. Go to **Access Codes** → change both codes to something private
6. Share the new teacher code with your teachers
7. Students can sign up freely (no code needed)

---

## Features Summary

| Feature | Where |
|---------|-------|
| Student marks history | Student Dashboard → My Marks |
| Enter/edit marks | Teacher Dashboard → Marks Entry |
| Class reports & charts | Teacher Dashboard → Reports |
| Digital library (PDFs) | Library (all roles) |
| AI study assistant | Student Dashboard → AI Assistant |
| AI marks calculator | Teacher Dashboard → AI Calculator |
| Student database CRUD | Admin Dashboard → Students |
| Export CSV | Admin Dashboard → Export Data |
| Rotate access codes | Admin Dashboard → Access Codes |
| Analytics | Admin Dashboard → Analytics |

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS with custom design system
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **AI:** Claude claude-sonnet-4-20250514 (Anthropic API)
- **State:** Zustand
- **Tables:** TanStack Table v8
- **Charts:** Recharts
- **Hosting:** Vercel (free tier supports 3,000+ users easily)

---

## Troubleshooting

**"Invalid API key" error**
→ Double-check your `.env.local` — no extra spaces, no quotes around values

**Database error on signup**
→ Make sure you ran the full `supabase-schema.sql` in Supabase SQL Editor

**AI not responding**
→ Check your `ANTHROPIC_API_KEY` is correct and has credits

**PDF upload not working**
→ Make sure the `library` Supabase Storage bucket is set to **Public**

**Page not found after deploy**
→ In Vercel, set Framework Preset to **Next.js**

---

*Pahore Academy Mianwali — Built with Claude AI*
