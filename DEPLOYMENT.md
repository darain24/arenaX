# Vercel Deployment Guide

This guide covers deploying both the frontend (Next.js) and backend (Express) to Vercel.

## Prerequisites

1. Vercel account (sign up at [vercel.com](https://vercel.com))
2. Vercel CLI installed: `npm i -g vercel`
3. Environment variables ready (DATABASE_URL, JWT_SECRET)

## Deployment Steps

### 1. Backend Deployment

#### Step 1: Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

#### Step 2: Deploy Backend
```bash
cd backend
vercel login
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No**
- Project name? (e.g., `arenax-backend`)
- Directory? `./`
- Override settings? **No**

#### Step 3: Set Environment Variables
After deployment, set environment variables in Vercel Dashboard:

1. Go to your project on [vercel.com](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:

   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - A secure random string (e.g., use `openssl rand -hex 32`)

#### Step 4: Redeploy with Environment Variables
```bash
vercel --prod
```

#### Step 5: Get Backend URL
After deployment, Vercel will provide a URL like:
```
https://arenax-backend.vercel.app
```
**Save this URL** - you'll need it for the frontend.

### 2. Frontend Deployment

#### Step 1: Deploy Frontend
```bash
cd frontend/arenax
vercel login
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No**
- Project name? (e.g., `arenax-frontend`)
- Directory? `./`
- Override settings? **No**

#### Step 2: Set Environment Variables
After deployment, set environment variables in Vercel Dashboard:

1. Go to your frontend project on [vercel.com](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Add:

   - `NEXT_PUBLIC_API_URL` - Your backend URL (from Step 5 above)
     Example: `https://arenax-backend.vercel.app`

#### Step 3: Redeploy with Environment Variables
```bash
vercel --prod
```

## Alternative: Deploy via GitHub

### 1. Push to GitHub
```bash
# In root directory
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/arenaX.git
git push -u origin main
```

### 2. Import Projects in Vercel

#### Backend:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Set **Root Directory** to `backend`
4. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
5. Click **Deploy**

#### Frontend:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Set **Root Directory** to `frontend/arenax`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` (your backend URL)
5. Click **Deploy**

## Environment Variables Summary

### Backend (.env or Vercel)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key-here
```

### Frontend (.env.local or Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

## Troubleshooting

### Backend Issues

1. **Prisma Client not generated**
   - Ensure `build` script runs `prisma generate`
   - Check Vercel build logs for Prisma errors

2. **Database connection errors**
   - Verify `DATABASE_URL` is correct in Vercel environment variables
   - Ensure database allows connections from Vercel IPs
   - Check SSL requirements (add `?sslmode=require` if needed)

3. **CORS errors**
   - Backend CORS is configured to allow all origins
   - If issues persist, check CORS settings in `src/app.js`

### Frontend Issues

1. **API calls failing**
   - Verify `NEXT_PUBLIC_API_URL` is set correctly
   - Check browser console for network errors
   - Ensure backend URL is accessible

2. **Build errors**
   - Check Next.js build logs in Vercel
   - Ensure all dependencies are in `package.json`

## Local Development

For local development, create `.env.local` in `frontend/arenax`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

And `.env` in `backend`:

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=dev-secret-change-me
```

## Post-Deployment

After both are deployed:

1. Test the frontend URL - should load the home page
2. Test signup - should create user in database
3. Test login - should authenticate and redirect
4. Check Vercel logs for any errors

## Continuous Deployment

Once connected to GitHub, Vercel will automatically deploy on every push to `main` branch.

