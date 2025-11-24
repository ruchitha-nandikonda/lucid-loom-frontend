# 🚀 Local Development Setup

## Localhost URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Backend Docs**: http://localhost:8000/docs

## Quick Start

### Option 1: Using Startup Scripts (Easiest)

**Terminal 1 - Start Backend:**
```bash
cd /Users/ruchithanandikonda/Desktop/Project/lucid-loom
./start-backend.sh
```

**Terminal 2 - Start Frontend:**
```bash
cd /Users/ruchithanandikonda/Desktop/Project/lucid-loom
./start-frontend.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd /Users/ruchithanandikonda/Desktop/Project/lucid-loom/dream-backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd /Users/ruchithanandikonda/Desktop/Project/lucid-loom/dream-frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env file in `dream-backend/`)

Create `dream-backend/.env`:
```env
# Database (SQLite - no setup needed)
DATABASE_URL=sqlite:///./dreams.db

# JWT Secret (generate a random string)
SECRET_KEY=your-secret-key-here-change-this

# Groq API (FREE - for text generation)
GROQ_API_KEY=your_groq_api_key_here

# OpenAI API (for images - optional, costs $0.04 per image)
OPENAI_API_KEY=your_openai_api_key_here

# Email (for OTP verification)
# Option 1: SendGrid (recommended for production)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your-email@example.com
SENDGRID_FROM_NAME=Lucid Loom

# Option 2: SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Lucid Loom
```

### Frontend (.env file in `dream-frontend/`)

Create `dream-frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

## Get API Keys

### 1. Groq API Key (FREE - Required for text generation)
1. Go to: https://console.groq.com/
2. Sign up/login
3. Create API key
4. Copy and add to `dream-backend/.env` as `GROQ_API_KEY`

### 2. OpenAI API Key (Optional - for images)
1. Go to: https://platform.openai.com/api-keys
2. Create API key
3. Add to `dream-backend/.env` as `OPENAI_API_KEY`
4. **Note**: Images cost $0.04 each. You can skip this and still get full text interpretation.

### 3. Email Setup (Choose one)

**Option A: SendGrid (Recommended)**
1. Go to: https://sendgrid.com/
2. Sign up (free tier: 100 emails/day)
3. Create API key
4. Add to `dream-backend/.env`

**Option B: Gmail SMTP**
1. Enable 2-factor authentication on Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Add to `dream-backend/.env`

## Testing Locally

1. **Start Backend** (Terminal 1):
   ```bash
   cd dream-backend
   source venv/bin/activate
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   Should see: `Uvicorn running on http://0.0.0.0:8000`

2. **Start Frontend** (Terminal 2):
   ```bash
   cd dream-frontend
   npm run dev
   ```
   Should see: `Local: http://localhost:5173/`

3. **Open Browser**:
   - Go to: http://localhost:5173
   - You should see the landing page

4. **Test Registration**:
   - Click "Sign up"
   - Enter email and password
   - Should redirect to `/verify-otp` page
   - Check your email for OTP code
   - Enter OTP
   - Should redirect to home page (DreamList)

5. **Test Login**:
   - Go to: http://localhost:5173/login
   - Enter email and password
   - Should redirect to home page (DreamList)
   - Should stay logged in (check Local Storage for `token`)

## Troubleshooting

### Backend won't start
- Check if port 8000 is already in use: `lsof -i :8000`
- Make sure you're in the `dream-backend` directory
- Check that `.env` file exists

### Frontend won't start
- Check if port 5173 is already in use: `lsof -i :5173`
- Run `npm install` to install dependencies
- Check that `dream-frontend/.env` has `VITE_API_URL=http://localhost:8000`

### CORS errors
- Make sure backend is running on port 8000
- Check `dream-backend/main.py` has `http://localhost:5173` in CORS origins

### Token not persisting
- Check browser DevTools → Application → Local Storage
- Should see `token` key after login
- Clear Local Storage and try again

### Dreams not loading
- Check browser console for errors
- Check Network tab for `/dreams` request
- Verify backend is running and accessible at http://localhost:8000

## Quick Commands

```bash
# Backend
cd dream-backend
source venv/bin/activate
uvicorn main:app --reload --port 8000

# Frontend
cd dream-frontend
npm run dev

# Check if ports are in use
lsof -i :8000  # Backend
lsof -i :5173  # Frontend
```

