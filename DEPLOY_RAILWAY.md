# Deploy Backend to Railway

This guide will help you deploy your Lucid Loom backend to Railway so your Vercel frontend can access it.

## Step 1: Install Railway CLI (Optional but Recommended)

```bash
# macOS
brew install railway

# Or download from https://railway.app/cli
```

## Step 2: Login to Railway

```bash
railway login
```

This will open your browser to authenticate.

## Step 3: Create a New Project

```bash
cd dream-backend
railway init
```

Follow the prompts to create a new project.

## Step 4: Set Environment Variables

You need to set all your environment variables in Railway:

```bash
railway variables set SECRET_KEY="your_super_secret_key_here"
railway variables set ALGORITHM="HS256"
railway variables set ACCESS_TOKEN_EXPIRE_MINUTES="60"
railway variables set OPENAI_API_KEY="your_openai_api_key"
railway variables set SMTP_HOST="smtp.gmail.com"
railway variables set SMTP_PORT="587"
railway variables set SMTP_USER="lucidloom.app@gmail.com"
railway variables set SMTP_PASSWORD="zrwm gvdp votu ycjm"
railway variables set SMTP_FROM_EMAIL="lucidloom.app@gmail.com"
railway variables set SMTP_FROM_NAME="Lucid Loom"
```

**Important:** For production, you should use a PostgreSQL database instead of SQLite. Railway provides a PostgreSQL service you can add.

## Step 5: Add PostgreSQL Database (Recommended)

1. In Railway dashboard, click "New" → "Database" → "Add PostgreSQL"
2. Railway will automatically set `DATABASE_URL` environment variable
3. Update your code to use PostgreSQL instead of SQLite

Or set the database URL manually:
```bash
railway variables set SQLALCHEMY_DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

## Step 6: Deploy

```bash
railway up
```

This will build and deploy your backend. Railway will give you a public URL like `https://your-app.railway.app`

## Step 7: Update Vercel Environment Variable

1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Add or update `VITE_API_URL` with your Railway URL:
   ```
   VITE_API_URL=https://your-app.railway.app
   ```
4. Redeploy your Vercel frontend

## Alternative: Deploy via Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo" (connect your GitHub)
4. Select your `lucid-loom` repository
5. Set root directory to `dream-backend`
6. Add all environment variables in the dashboard
7. Railway will automatically deploy

## Troubleshooting

- **Check logs:** `railway logs` or view in Railway dashboard
- **Database issues:** Make sure PostgreSQL is added and `DATABASE_URL` is set
- **Port issues:** Railway sets `$PORT` automatically, make sure your code uses it
- **CORS errors:** The backend CORS is already configured for Vercel domains

## Next Steps

After deployment:
1. Test the backend: `curl https://your-app.railway.app/health`
2. Update Vercel `VITE_API_URL`
3. Test registration from your Vercel frontend
4. Check that OTP emails are being sent

