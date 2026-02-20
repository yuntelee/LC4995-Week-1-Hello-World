# LC4995 Week 1 - Hello World + Supabase List

## Assignment 1 (Hello World + GitHub + Vercel)

### 1) Create app and run locally

```bash
npx create-next-app@latest . --typescript --eslint --app --use-npm --yes
npm run dev
```

Open `http://localhost:3000`.

### 2) Git workflow

```bash
git add .
git commit -m "Assignment 1: Hello World Next.js app"
git push origin main
```

### 3) Connect GitHub repo to Vercel

1. Go to `https://vercel.com/new`.
2. Import Git repository `yuntelee/LC4995-Week-1-Hello-World`.
3. Keep Framework Preset as **Next.js**.
4. Click **Deploy**.

### 4) Disable deployment protection on Vercel

1. Open project in Vercel Dashboard.
2. Go to **Settings** -> **Deployment Protection**.
3. Disable protection for **Preview** and **Production** as required.
4. Save settings.

### 5) Get commit-specific deployment URL

```bash
git rev-parse --short HEAD
```

Then in Vercel:
1. Go to **Deployments**.
2. Open the deployment that matches that commit SHA.
3. Copy that deployment URL.

## Assignment 2 (Supabase /list route)

### 1) Install Supabase client

```bash
npm install @supabase/supabase-js
```

### 2) Local environment config

Create `.env.local` in project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qihsgnfjqmkjmoowyfbn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your Supabase project's anon key.

### 3) Vercel environment variables

In Vercel project -> **Settings** -> **Environment Variables**, add:

- `NEXT_PUBLIC_SUPABASE_URL` = `https://qihsgnfjqmkjmoowyfbn.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key

Apply to **Production**, **Preview**, and **Development**, then redeploy.

### 4) Deploy and redeploy flow

```bash
git add .
git commit -m "Assignment 2: Add Supabase list route"
git push origin main
```

After push, Vercel auto-deploys. To force a fresh deploy from dashboard, open **Deployments** and click **Redeploy**.

### 5) Verify

- Home page: `/`
- Supabase list page: `/list`

`/list` fetches rows from table `data` using a Server Component.
