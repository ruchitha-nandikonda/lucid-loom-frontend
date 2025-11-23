# ⚡ Quick Fix Guide

## Current Issue: OpenAI API Key Not Configured

You're seeing errors because the OpenAI API key needs to be set up. Here's the fastest way to fix it:

### Option 1: Use the Setup Script (Easiest)

```bash
cd /Users/ruchithanandikonda/Desktop/Project/lucid-loom
./setup-api-key.sh
```

Follow the prompts to enter your API key.

### Option 2: Manual Setup (2 minutes)

1. **Get your API key:**
   - Visit: https://platform.openai.com/api-keys
   - Sign in or create account
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

2. **Edit the .env file:**
   ```bash
   cd dream-backend
   # Open .env in your editor
   # Find this line:
   OPENAI_API_KEY=your_openai_api_key_here
   # Replace with:
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Restart backend:**
   - Stop the current server (Ctrl+C in the terminal running uvicorn)
   - Start it again:
     ```bash
     cd dream-backend
     source venv/bin/activate
     uvicorn main:app --reload
     ```

4. **Test:**
   - Refresh your browser
   - Try creating a dream or using "Transform Your Dream"
   - It should work now!

### Verify It's Working

After setting the key and restarting:

1. **Check the key is set:**
   ```bash
   cd dream-backend
   grep OPENAI_API_KEY .env
   ```
   Should show: `OPENAI_API_KEY=sk-...` (not the placeholder)

2. **Check backend logs:**
   - Look for any error messages
   - Should not see "API key not configured" errors

3. **Test in browser:**
   - Try the "Transform Your Dream" feature
   - Should work without errors

### Common Issues

**"Still seeing errors after setup"**
- Make sure you restarted the backend server
- Check there are no extra spaces in `.env` file
- Verify the key starts with `sk-`

**"Don't have an OpenAI account"**
- Sign up at: https://platform.openai.com/signup
- Add payment method (required for API access)
- Get $5 free credit to start

**"Key is invalid"**
- Make sure you copied the entire key
- Keys start with `sk-` and are long strings
- Generate a new key if needed

### What Features Need the API Key?

- ✅ Dream interpretation (poetic narrative, meaning, symbols, emotions)
- ✅ Dream image generation (DALL-E 3)
- ✅ Transform Your Dream (style rewrites)
- ✅ Symbol explanations
- ✅ Pattern analysis

**Without the API key, these features will show error messages.**

---

**Once you set the API key and restart the backend, everything will work!** 🚀

