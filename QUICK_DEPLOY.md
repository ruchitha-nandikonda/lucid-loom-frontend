# Quick Deploy to Railway

## Fastest Way (5 minutes)

### Option 1: Railway Dashboard (Easiest)

1. **Go to [railway.app](https://railway.app)** and sign up/login
2. **Click "New Project"** → **"Deploy from GitHub repo"**
3. **Connect your GitHub** and select the `lucid-loom` repository
4. **Set Root Directory** to `dream-backend`
5. **Add Environment Variables** in Railway dashboard:
   - `SECRET_KEY` = (generate a random string)
   - `ALGORITHM` = `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES` = `60`
   - `OPENAI_API_KEY` = (your OpenAI key)
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `lucidloom.app@gmail.com`
   - `SMTP_PASSWORD` = `zrwm gvdp votu ycjm`
   - `SMTP_FROM_EMAIL` = `lucidloom.app@gmail.com`
   - `SMTP_FROM_NAME` = `Lucid Loom`
6. **Add PostgreSQL Database:**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway automatically sets `DATABASE_URL`
7. **Deploy** - Railway will automatically build and deploy
8. **Copy your Railway URL** (e.g., `https://your-app.railway.app`)

### Option 2: Railway CLI

```bash
# Install Railway CLI
brew install railway  # macOS
# Or: npm i -g @railway/cli

# Login
railway login

# Initialize project
cd dream-backend
railway init

# Set environment variables
railway variables set SECRET_KEY="your_secret_key"
railway variables set OPENAI_API_KEY="your_openai_key"
railway variables set SMTP_USER="lucidloom.app@gmail.com"
railway variables set SMTP_PASSWORD="zrwm gvdp votu ycjm"
# ... (add all other variables)

# Deploy
railway up
```

## Update Vercel

1. Go to your **Vercel project** → **Settings** → **Environment Variables**
2. Add/Update: `VITE_API_URL` = `https://your-app.railway.app`
3. **Redeploy** your Vercel frontend

## Test

1. Visit your Vercel site: `https://lucid-loom.vercel.app`
2. Try registering a new user
3. Check email for OTP code
4. Verify and login!

## Done! 🎉

Your backend is now live and accessible from Vercel!

