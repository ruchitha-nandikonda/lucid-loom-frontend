# 🚀 Quick Setup - Just Run This!

## The Simplest Way to Fix the Error

**Just run this one command:**

```bash
cd /Users/ruchithanandikonda/Desktop/Project/lucid-loom
./ONE_COMMAND_SETUP.sh
```

This script will:
1. ✅ Check your current setup
2. ✅ Guide you to get your API key
3. ✅ Let you paste it directly
4. ✅ Save it automatically
5. ✅ Tell you what to do next

**That's it!** No manual file editing needed.

---

## What You'll See

The script will:
- Show you the link to get your API key
- Ask you to paste it
- Save it automatically
- Tell you to restart the backend

**Total time: 2 minutes**

---

## After Running the Script

1. **Restart backend:**
   - Find terminal with `uvicorn main:app --reload`
   - Press `Ctrl+C`
   - Run:
     ```bash
     cd dream-backend
     source venv/bin/activate
     uvicorn main:app --reload
     ```

2. **Refresh browser:**
   - Go to http://localhost:5174
   - Press F5 or Cmd+R
   - Try "Transform Your Dream" again

3. **It works!** ✨

---

## Alternative: Manual Setup

If you prefer to do it manually:

1. Get key: https://platform.openai.com/api-keys
2. Edit: `dream-backend/.env`
3. Change: `OPENAI_API_KEY=your_openai_api_key_here`
4. To: `OPENAI_API_KEY=sk-your-actual-key`
5. Restart backend

---

**The script makes it super easy - just run it!** 🎯

