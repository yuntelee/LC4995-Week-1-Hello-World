This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Supabase + Auth + Caption Voting (Assignments #3/#4)

### Environment variables

Set these in `.env.local` (for local) and in Vercel Project Settings → Environment Variables (for deployment):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### OAuth redirect URI (required)

The app uses an auth callback route at `/auth/callback`.

- Local redirect URI: `http://localhost:3000/auth/callback`
- Vercel redirect URI: `https://<your-vercel-domain>/auth/callback`

Make sure your Google OAuth client and Supabase Auth settings allow redirecting to exactly `/auth/callback`.

### Voting behavior

The captions list is on `/data`.

- Logged-in users can upvote/downvote captions.
- Submitting a vote inserts a new row into the `caption_votes` table.
- Logged-out users see the vote buttons disabled and cannot submit votes.

Expected `caption_votes` columns used by the app:

- `caption_id` (string/uuid)
- `user_id` (string/uuid)
- `vote_type` ("upvote" | "downvote")
- `created_at` (timestamp)

Note: This repo does not change any RLS policies. Configure RLS in Supabase separately (as required by your course).

### Vercel deployment protection

If you want to test logged-out behavior in an Incognito window, turn off Vercel “Deployment Protection” for the project.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
