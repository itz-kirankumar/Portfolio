# Portfolio Platform Scale-up Plan

This document outlines the architecture and tasks required to finalize all remaining non-payment features of the platform.

## Proposed Changes

### Phase 1: Client-Side Enhancements (Tiptap & Media)
- **Tiptap Slash Commands:** Implement `@tiptap/suggestion` and `tippy.js` to create a Notion-style `/` slash command menu for adding blocks (Headings, Quotes, Images).
- **Tiptap Auto-Saving:** Add a React hook that debounces editor changes and automatically saves the draft in the background (using `actions.ts`).
- **Media Optimization:** Introduce `browser-image-compression` to resize and compress large images natively on the client-side *before* uploading them via the GCS signed URL.
- **Drag-and-Drop Media Library:** Enhance the admin `Media` page to support dragging files directly onto the grid to upload them.

### Phase 2: Engagement & Comments
- **Advanced Comment Threads:**
  - Update `Comment` schema to support `parentId` for threaded replies.
  - Add emoji reactions support (e.g., a map of `reaction -> count`).
  - Implement a client-side "One Like Per Device" lock using `localStorage` + simple IP tracking in an Edge API route.

### Phase 3: SEO & Growth
- **Dynamic OpenGraph (`@vercel/og`):**
  - Create `app/api/og/route.tsx` to dynamically render custom OpenGraph images for blog posts using their title and background covers.
  - Update `app/writing/[slug]/page.tsx` metadata generator to point to this new API route.
- **Newsletter Broadcasting:**
  - Integrate `resend` SDK in `app/api/newsletter/broadcast/route.ts`.
  - Fetch all active subscribers from the database and send the rich-text payload via email.

### Phase 4: Analytics
- **Admin Dashboard Visuals:**
  - Build a custom `/admin` (or `/admin/analytics`) page fetching aggregated data from `app/api/track`. 
  - Show quick stats: Total views, unique visitors, most viewed articles.

## User Review Required
No major breaking changes to schemas, but we are extending `comments`. Let me know if you approve this sequential breakdown.

## Open Questions
- Do you want emails sent via Resend to use a specific generic "From" email address (e.g., `hello@yourdomain.com`)? We can set this in `.env`.
