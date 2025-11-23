# 🚀 Lucid Loom - Quick Start Guide

## ⚡ Fastest Way to Run

### Option 1: Docker (Recommended - 2 minutes)
```bash
# 1. Set up environment
cp .env.example .env
# Edit .env: add OPENAI_API_KEY and SECRET_KEY

# 2. Start everything
docker-compose up -d

# 3. Access
# Frontend: http://localhost
# Backend: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Option 2: Development Mode (5 minutes)
```bash
# Terminal 1 - Backend
cd dream-backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 2 - Frontend  
cd dream-frontend
npm run dev

# Access: http://localhost:5174
```

## 📋 Prerequisites Checklist

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] Docker & Docker Compose (for Docker option)
- [ ] OpenAI API key (get from https://platform.openai.com/api-keys)

## 🔑 Required Environment Variables

Create `.env` in `dream-backend/`:
```
SECRET_KEY=your_secret_key_here
OPENAI_API_KEY=sk-your-openai-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## 🎯 First Steps After Starting

1. **Register** - Create your account
2. **Login** - Access your dashboard
3. **Create Dream** - Add your first dream
4. **Wait for AI** - Processing happens in background
5. **Explore** - Check out gallery, analytics, patterns!

## 🐛 Troubleshooting

**Backend won't start:**
- Check Python version: `python3 --version`
- Verify virtual environment is activated
- Check `.env` file exists and has OPENAI_API_KEY

**Frontend won't start:**
- Check Node version: `node --version`
- Run `npm install` in dream-frontend
- Check port 5174 is available

**Docker issues:**
- Check Docker is running: `docker ps`
- View logs: `docker-compose logs -f`
- Rebuild: `docker-compose up -d --build`

**API errors:**
- Verify OpenAI API key is valid
- Check backend is running on port 8000
- Check browser console for CORS errors

## 📞 Need Help?

1. Check `README.md` for detailed setup
2. Check `DEPLOYMENT.md` for production setup
3. Check `PROJECT_COMPLETE.md` for feature list
4. Check backend logs for errors
5. Check browser console (F12) for frontend errors

---

**You're all set! Start exploring your dreams! 🌙**

