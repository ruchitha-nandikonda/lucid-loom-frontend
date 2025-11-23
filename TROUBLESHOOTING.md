# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### ❌ "Something went wrong. Try again." Error

This error typically occurs when:
1. **OpenAI API key is not configured**
2. **Network connectivity issues**
3. **Backend server not running**

#### Solution 1: Configure OpenAI API Key

1. **Check current status:**
   ```bash
   cd dream-backend
   cat .env | grep OPENAI_API_KEY
   ```

2. **If it shows the placeholder:**
   ```bash
   # Edit .env file
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Get your API key:**
   - Visit: https://platform.openai.com/api-keys
   - Sign in or create an account
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

4. **Update .env file:**
   ```bash
   cd dream-backend
   # Open .env in your editor
   # Replace: OPENAI_API_KEY=your_openai_api_key_here
   # With: OPENAI_API_KEY=sk-your-actual-key-here
   ```

5. **Restart backend:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   source venv/bin/activate
   uvicorn main:app --reload
   ```

#### Solution 2: Check Backend Status

1. **Verify backend is running:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"healthy"}`

2. **Check backend logs:**
   - Look at the terminal where uvicorn is running
   - Check for error messages
   - Look for "OpenAI API key not configured" errors

#### Solution 3: Check Network/CORS

1. **Verify frontend can reach backend:**
   - Open browser console (F12)
   - Check Network tab for failed requests
   - Look for CORS errors

2. **Check API URL:**
   - Frontend should connect to `http://localhost:8000`
   - Verify in `dream-frontend/src/api.js`

### ❌ "No image" Showing on Dreams

**Cause:** Image generation failed or API key not configured

**Solution:**
1. **Check if interpretation exists:**
   - Open dream detail page
   - Check if there's a "meaning" section
   - If it shows an error message, that's the issue

2. **Regenerate the dream:**
   - Click "🔄 Regenerate" button
   - Wait for processing to complete
   - Refresh the page

3. **Verify API key:**
   - Ensure OpenAI API key is set correctly
   - Check that DALL-E access is enabled on your OpenAI account

### ❌ Registration Fails

**Cause:** Database schema mismatch

**Solution:**
1. **Check database:**
   ```bash
   cd dream-backend
   sqlite3 dreams.db ".schema users"
   ```

2. **If columns are missing:**
   ```bash
   sqlite3 dreams.db "ALTER TABLE users ADD COLUMN reset_token TEXT;"
   sqlite3 dreams.db "ALTER TABLE users ADD COLUMN reset_token_expires DATETIME;"
   ```

3. **Or recreate database:**
   ```bash
   rm dreams.db
   # Restart backend - it will recreate the database
   ```

### ❌ WebSocket Connection Failed

**Cause:** WebSocket server not running or connection issue

**Solution:**
1. **Check WebSocket endpoint:**
   - Backend should be running on port 8000
   - WebSocket URL: `ws://localhost:8000/ws/dream-status/{dream_id}`

2. **Check browser console:**
   - Look for WebSocket connection errors
   - Check if port 8000 is accessible

3. **Fallback:**
   - Dreams will still be created
   - You can manually refresh to see results
   - Or navigate to the dream detail page

### ❌ "Invalid email or password" on Login

**Cause:** User doesn't exist or password is incorrect

**Solution:**
1. **Register a new account:**
   - Go to Register page
   - Create a new account
   - Then try logging in

2. **Check database:**
   ```bash
   cd dream-backend
   sqlite3 dreams.db "SELECT id, email FROM users;"
   ```

3. **Reset password:**
   - Use "Forgot Password" feature
   - Or create a new account

### ❌ Port Already in Use

**Error:** `Address already in use` or port conflict

**Solution:**
1. **Find process using port:**
   ```bash
   # For port 8000 (backend)
   lsof -i :8000
   
   # For port 5174 (frontend)
   lsof -i :5174
   ```

2. **Kill the process:**
   ```bash
   kill -9 <PID>
   ```

3. **Or use different ports:**
   - Backend: Change in `uvicorn` command
   - Frontend: Change in `vite.config.js`

### ❌ Docker Issues

**Error:** Container won't start or build fails

**Solution:**
1. **Check Docker is running:**
   ```bash
   docker ps
   ```

2. **Rebuild containers:**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

3. **Check logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Check .env file:**
   - Ensure `.env` exists in `dream-backend/`
   - Verify all required variables are set

## Quick Diagnostic Commands

```bash
# Check backend health
curl http://localhost:8000/health

# Check API key status
cd dream-backend
python3 -c "import os; from dotenv import load_dotenv; load_dotenv(); key = os.getenv('OPENAI_API_KEY', ''); print('✅ Configured' if key and key != 'your_openai_api_key_here' and key.startswith('sk-') else '❌ Not configured')"

# Check database
cd dream-backend
sqlite3 dreams.db ".tables"
sqlite3 dreams.db "SELECT COUNT(*) FROM users;"
sqlite3 dreams.db "SELECT COUNT(*) FROM dreams;"

# Check backend process
ps aux | grep uvicorn

# Check frontend process
ps aux | grep vite
```

## Getting Help

1. **Check logs:**
   - Backend: Terminal where uvicorn is running
   - Frontend: Browser console (F12)
   - Docker: `docker-compose logs -f`

2. **Check documentation:**
   - `README.md` - Setup instructions
   - `SETUP_OPENAI.md` - API key setup
   - `REGENERATE_FEATURE.md` - Regeneration guide

3. **Common fixes:**
   - Restart backend server
   - Clear browser cache
   - Check `.env` file exists and has correct values
   - Verify all dependencies are installed

---

**Still having issues?** Check the error message carefully - it usually tells you exactly what's wrong!

