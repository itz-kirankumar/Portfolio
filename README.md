# Portfolio Builder — Setup & Development Guide

## Stack
- **Next.js 14** (App Router + TypeScript)
- **Firebase** (Firestore + Storage + Auth)
- **NextAuth.js** (Google OAuth)
- **Tiptap** (Rich text editor)
- **@hello-pangea/dnd** (Drag & drop)
- **Razorpay** (Payments)
- **Tailwind CSS + shadcn/ui**
- **Vercel** (Deployment)

---

## 1. Install Missing Packages

Run these in your project root:

```bash
# Rich text editor (React 19 compatible)
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit \
  @tiptap/extension-image @tiptap/extension-link \
  @tiptap/extension-youtube @tiptap/extension-color \
  @tiptap/extension-text-style @tiptap/extension-underline \
  @tiptap/extension-placeholder

# Drag & drop (React 19 compatible)
npm install @hello-pangea/dnd

# Form handling + validation
npm install react-hook-form @hookform/resolvers zod

# Utilities
npm install clsx class-variance-authority tailwind-merge lucide-react

# Razorpay
npm install razorpay

# Firebase Admin (server-side uploads)
npm install firebase-admin

# Tailwind typography plugin (for prose styles)
npm install -D @tailwindcss/typography

# Init shadcn (run interactively)
npx shadcn@latest init
npx shadcn@latest add button input dialog sheet tabs card badge switch label textarea select toast
```

---

## 2. Copy Files Into Your Project

Copy each file from the output folder into your project maintaining the exact same folder structure:

```
outputs/
  types/index.ts              → types/index.ts
  lib/firebase.ts             → lib/firebase.ts
  lib/firestore.ts            → lib/firestore.ts
  lib/auth.ts                 → lib/auth.ts
  lib/utils.ts                → lib/utils.ts
  store/portfolioStore.ts     → store/portfolioStore.ts
  app/layout.tsx              → app/layout.tsx
  app/providers.tsx           → app/providers.tsx
  app/globals.css             → app/globals.css
  app/login/page.tsx          → app/login/page.tsx
  app/dashboard/...           → app/dashboard/...
  app/[username]/page.tsx     → app/[username]/page.tsx
  app/api/...                 → app/api/...
  components/...              → components/...
  next.config.ts              → next.config.ts
  tailwind.config.ts          → tailwind.config.ts
  firestore.rules             → firestore.rules
  storage.rules               → storage.rules
```

---

## 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

### Google OAuth
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project → Enable **Google+ API** and **OAuth consent screen**
3. Credentials → Create → OAuth 2.0 Client ID → Web Application
4. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret

### Firebase
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create project → Enable **Firestore**, **Storage**, **Authentication (Google)**
3. Project Settings → Your Apps → Add Web App → Copy config
4. Project Settings → Service Accounts → Generate New Private Key (for Admin SDK)

### Razorpay
1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Settings → API Keys → Generate Test Key
3. Copy Key ID and Secret

### Generate NEXTAUTH_SECRET
```bash
# Mac/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

## 4. Firebase Rules

Deploy security rules:
```bash
# Install Firebase CLI (if not already)
npm install -g firebase-tools

firebase login
firebase init  # select Firestore + Storage, link your project

firebase deploy --only firestore:rules
firebase deploy --only storage
```

---

## 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- Login page: `/login`
- Dashboard: `/dashboard`
- Public portfolio: `/your-username`

---

## 6. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

vercel
```

Or connect your GitHub repo in [vercel.com](https://vercel.com) and set all environment variables in:
**Project → Settings → Environment Variables**

Add all vars from `.env.local` (include both Production and Preview environments).

Also update your Google OAuth redirect URI to your Vercel domain:
`https://your-app.vercel.app/api/auth/callback/google`

---

## 7. Build Order Checklist

- [ ] All packages installed
- [ ] Files copied into project
- [ ] `.env.local` filled out
- [ ] Firebase project created (Firestore + Storage + Auth enabled)
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] `npm run dev` — login works
- [ ] Dashboard loads
- [ ] Can add/edit/delete a text block
- [ ] Public portfolio page works at `/username`
- [ ] Deploy to Vercel

---

## Folder Structure (final)

```
app/
  login/page.tsx
  providers.tsx
  layout.tsx
  globals.css
  dashboard/
    layout.tsx
    page.tsx
    blocks/page.tsx
    theme/page.tsx
    services/page.tsx
    payments/page.tsx
    settings/page.tsx
  [username]/page.tsx
  api/
    auth/[...nextauth]/route.ts
    blocks/route.ts
    upload/route.ts
    profile/route.ts
    profile/check-username/route.ts
    razorpay/create-order/route.ts
    razorpay/verify/route.ts
components/
  blocks/
    BlockRenderer.tsx  AnimationWrapper.tsx
    TextBlock.tsx      ImageBlock.tsx
    YouTubeBlock.tsx   InstagramBlock.tsx
    LinkedInBlock.tsx  MapBlock.tsx
    PDFBlock.tsx       TestimonialBlock.tsx
    ServiceBlock.tsx   ButtonBlock.tsx
    BlogBlock.tsx      SkillsBlock.tsx
    ProjectBlock.tsx   SocialBlock.tsx
    DividerBlock.tsx
  dashboard/
    Sidebar.tsx        BlockPicker.tsx
    BlockEditor.tsx
  editor/
    TiptapEditor.tsx
  payment/
    RazorpayButton.tsx
lib/
  firebase.ts  firestore.ts  auth.ts  utils.ts
store/
  portfolioStore.ts
types/
  index.ts
```