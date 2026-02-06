# Nexus Web Dashboard

Web companion for the [Nexus](https://github.com/Kryptoxotis/nexus) Android app. Manage NFC passes, businesses, and members from any browser.

## Live

[https://kryptoxotis-nexus-web.vercel.app](https://kryptoxotis-nexus-web.vercel.app)

## Tech Stack

- Next.js 14 (App Router)
- Supabase (auth, database)
- Tailwind CSS
- TypeScript

## Pages

| Route | Role | Description |
|-------|------|-------------|
| `/` | Public | Landing page with Google Sign-In |
| `/dashboard` | All | Role-based redirect |
| `/dashboard/passes` | All | View/manage NFC passes |
| `/dashboard/business` | Business | Manage your business |
| `/dashboard/business/members` | Business | Member management |
| `/dashboard/businesses` | Personal | Browse businesses |
| `/dashboard/logs` | All | Access log history |
| `/dashboard/settings` | All | Profile and role switching |

## Setup

```bash
npm install
cp .env.local.example .env.local
# Fill in your Supabase credentials
npm run dev
```

## Mobile App

See [nexus](https://github.com/Kryptoxotis/nexus) for the Android app.
