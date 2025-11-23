# Setting Up OpenAI API Key

To enable AI dream interpretation and image generation, you need to add your OpenAI API key.

## Quick Setup (Recommended)

**Use the automated setup script:**
```bash
./setup-api-key.sh
```

This script will:
- Check if your API key is configured
- Guide you through entering your key
- Update the `.env` file automatically

## Manual Setup

1. **Get your OpenAI API key:**
   - Go to https://platform.openai.com/api-keys
   - Sign in or create an account
   - Click "Create new secret key"
   - Copy the key (you won't be able to see it again!)

2. **Add the key to your `.env` file:**
   ```bash
   cd dream-backend
   # Open .env file and replace:
   OPENAI_API_KEY=your_openai_api_key_here
   # With your actual key:
   OPENAI_API_KEY=sk-...
   ```

3. **Restart the backend server:**
   - If the backend is running, stop it (Ctrl+C)
   - Start it again:
     ```bash
     source venv/bin/activate
     uvicorn main:app --reload
     ```

4. **Test it:**
   - Go to http://localhost:5174
   - Create a new dream
   - The AI should now process it!

## Notes:

- The API key starts with `sk-`
- Keep your API key secret - don't commit it to git
- OpenAI charges based on usage (GPT-4o-mini is very affordable)
- DALL-E 3 image generation costs ~$0.04 per image

## Troubleshooting:

If you still see errors:
1. Make sure the `.env` file is in the `dream-backend` directory
2. Make sure there are no extra spaces around the `=` sign
3. Restart the backend after changing `.env`
4. Check the backend logs for detailed error messages

