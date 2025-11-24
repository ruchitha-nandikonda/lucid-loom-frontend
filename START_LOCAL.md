# 🚀 Start Locally - Quick Guide

## Localhost URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000  
- **Backend Docs**: http://localhost:8000/docs

## Quick Start (2 Terminals)

### Terminal 1 - Backend:
```bash
cd /Users/ruchithanandikonda/Desktop/Project/lucid-loom/dream-backend
source venv/bin/activate  # or: python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt  # if not already installed
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2 - Frontend:
```bash
cd /Users/ruchithanandikonda/Desktop/Project/lucid-loom/dream-frontend
npm install  # if not already installed
npm run dev
```

### Then Open:
**http://localhost:5173** in your browser

## Environment Files Created

✅ `dream-frontend/.env` - Created with `VITE_API_URL=http://localhost:8000`
✅ `dream-backend/.env` - Created (you need to add your API keys)

## Required: Add API Keys to Backend

Edit `dream-backend/.env` and add:

1. **GROQ_API_KEY** (FREE - Required for text generation)
   - Get from: https://console.groq.com/
   - Replace `your_groq_api_key_here`

2. **OPENAI_API_KEY** (Optional - for images, costs $0.04 each)
   - Get from: https://platform.openai.com/api-keys
   - Replace `your_openai_api_key_here`
   - Or leave as-is if you don't want images

3. **SENDGRID_API_KEY** (For OTP emails)
   - Get from: https://sendgrid.com/
   - Replace `your_sendgrid_api_key`
   - Update `SENDGRID_FROM_EMAIL` with your email

## Test It

1. Start both servers (Terminal 1 & 2)
2. Open http://localhost:5173
3. You should see the landing page
4. Try registering a new account
5. Check your email for OTP code
6. Enter OTP to complete registration
7. Should redirect to home page (DreamList)

## Troubleshooting

**Backend won't start?**
- Check: `lsof -i :8000` (kill process if needed)
- Make sure you're in `dream-backend` directory
- Check `.env` file exists

**Frontend won't start?**
- Check: `lsof -i :5173` (kill process if needed)
- Run `npm install` first
- Check `.env` file has `VITE_API_URL=http://localhost:8000`

**CORS errors?**
- Backend should allow `http://localhost:5173` (already configured)
- Make sure backend is running on port 8000

**Token not working?**
- Check browser console for errors
- Check Local Storage (DevTools → Application → Local Storage)
- Should see `token` key after login

