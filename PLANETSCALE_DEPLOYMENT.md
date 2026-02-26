# PlanetScale & Vercel Deployment Guide for FinSentinel

This guide will help you deploy your FinSentinel app with PlanetScale MySQL database on Vercel.

## Prerequisites

- PlanetScale account (https://planetscale.com)
- Vercel account (https://vercel.com)
- GitHub repository connected to your Vercel project

## Step 1: Create PlanetScale Database

### 1.1 Create Organization & Database
1. Go to https://planetscale.com and sign up/log in
2. Create a new organization
3. Create a new database (e.g., "finsent inel")
4. Select a region close to your Vercel deployment region

### 1.2 Create Main Branch & Connection String
1. In PlanetScale dashboard, go to your database
2. Click "Connect" button
3. Select "Node.js" from the dropdown
4. Copy the connection string (looks like: `mysql://root:password@host/database`)
5. **SAVE THIS CONNECTION STRING** - you'll need it in Step 4

### 1.3 Run Database Schema Setup
You have two options:

**Option A: Using PlanetScale CLI (Recommended)**
```bash
npm install -g planetscale

# Authenticate with PlanetScale
pscale auth login

# Push schema
pscale db push-files finssentinel main < scripts/setup-planetscale.sql
```

**Option B: Using PlanetScale Dashboard**
1. Go to your database > "Console"
2. Paste the contents of `scripts/setup-planetscale.sql`
3. Execute the SQL

## Step 2: Prepare Your Project

### 2.1 Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

This will automatically install `mysql2` since we updated package.json.

### 2.2 Test Locally (Optional)
```bash
# Create .env.local file with your PlanetScale connection string
echo "DATABASE_URL=mysql://user:password@host/database" > .env.local

# Run your dev server
npm run dev
```

Visit `http://localhost:3000` to verify it works.

## Step 3: Connect PlanetScale to Vercel (Recommended)

### 3.1 Use Vercel Integration
1. Go to PlanetScale https://planetscale.com/docs/integrations/vercel
2. Click "Add to Vercel"
3. Select your Vercel project
4. Authorize the connection
5. PlanetScale will automatically add `DATABASE_URL` environment variable to Vercel

### 3.2 Manual Setup (If Integration Not Available)
1. Go to your Vercel project > Settings > Environment Variables
2. Add new environment variable:
   - **Name:** `DATABASE_URL`
   - **Value:** Your connection string from Step 1.2
   - **Environment:** Select all (Production, Preview, Development)
3. Click "Save"

## Step 4: Deploy to Vercel

### 4.1 Push to GitHub
```bash
git add .
git commit -m "Migrate from SQLite to PlanetScale"
git push origin main
```

### 4.2 Vercel Auto-Deployment
- Your Vercel project will automatically detect the push
- Vercel will build and deploy your app
- The build includes all the new mysql2 dependencies

### 4.3 Verify Deployment
1. Go to your Vercel project dashboard
2. Click on your latest deployment
3. Check the "Deployments" tab to see if build succeeded
4. Visit your deployed URL to test

## Step 5: Verify Database Connection

### 5.1 Test the API
1. Visit: `https://your-app.vercel.app/api/auth/signup`
2. Try creating a new account to test the database connection

### 5.2 Check Vercel Logs
```bash
# If you have Vercel CLI installed
vercel logs --prod
```

### 5.3 Monitor PlanetScale
1. Go to PlanetScale dashboard > your database
2. Check the "Analytics" tab for incoming connections
3. Look for "Insights" to see queries being executed

## Troubleshooting

### Issue: DATABASE_URL not found
**Solution:**
1. Go to Vercel > Settings > Environment Variables
2. Verify `DATABASE_URL` is added
3. Redeploy: Click "Redeploy" button in Vercel dashboard

### Issue: Connection timeout
**Solution:**
1. Verify connection string is correct (copy from PlanetScale again)
2. Check PlanetScale database is in "Ready" state
3. Verify your Vercel region matches PlanetScale region (or nearby)

### Issue: Authentication errors on login
**Solution:**
1. Ensure database schema was created successfully
2. Check PlanetScale console for any SQL errors
3. Verify the `users` table exists: Go to PlanetScale > Console > `SHOW TABLES;`

### Issue: Queries failing
**Solution:**
1. Review Vercel logs for specific error messages
2. Check that all API routes have been migrated from SQLite to PlanetScale
3. Verify parameter count matches in INSERT/UPDATE statements

## Advanced: Set Up Automatic Backups

### 5.1 Enable PlanetScale Backups
1. PlanetScale Dashboard > Your Database > Settings
2. Enable "Automatic Backups"
3. Set retention policy (e.g., 7 days)

### 5.2 Create Read-Only Replica
1. PlanetScale Dashboard > Your Database > Branches
2. Create a new branch for analytics queries
3. Use this branch for read-only operations

## Performance Optimization

### 1. Enable Query Caching
Add to your API routes:
```typescript
// Add cache control headers
response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
```

### 2. Use PlanetScale Connection Pooler
- PlanetScale automatically provides connection pooling
- Max 1000 connections per account (Enterprise: higher)

### 3. Monitor Performance
- PlanetScale Dashboard > Analytics > Slow Queries
- Optimize queries using appropriate indexes

## Next Steps

1. **Test thoroughly** in production before inviting users
2. **Set up monitoring** with Sentry or similar
3. **Configure backups** in PlanetScale settings
4. **Set up alerts** for high resource usage
5. **Document your architecture** for future reference

## Support

- PlanetScale Docs: https://planetscale.com/docs
- Vercel Docs: https://vercel.com/docs
- FinSentinel GitHub: https://github.com/Kishankumar1328/FinSentinel
