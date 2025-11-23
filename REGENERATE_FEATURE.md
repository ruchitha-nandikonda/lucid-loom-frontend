# 🔄 Dream Regeneration Feature

## Overview

The regeneration feature allows you to reprocess dreams that failed to generate interpretations or images, or to regenerate them with updated AI models.

## Features

### 1. Individual Dream Regeneration
- **Location:** Dream Detail page
- **Button:** "🔄 Regenerate" button appears when:
  - Dream has no interpretation
  - Dream has no image URL
- **Functionality:**
  - Deletes existing interpretation
  - Triggers background AI processing
  - Regenerates poetic narrative, meaning, symbols, emotions, and image
  - Shows real-time status updates

### 2. Bulk Regeneration from List
- **Location:** Dream List page
- **Button:** Small "🔄" button on dream cards missing images
- **Functionality:**
  - Quick regenerate without opening detail page
  - Shows processing status
  - Auto-refreshes after completion

## API Endpoint

```http
POST /dreams/{dream_id}/regenerate
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Dream regeneration started",
  "dream_id": 1
}
```

## How It Works

1. **User clicks regenerate** → Confirmation dialog appears
2. **Backend deletes old interpretation** → Clears existing data
3. **Background task starts** → AI processing begins
4. **WebSocket notification** → Real-time status updates
5. **Frontend refreshes** → New interpretation appears

## Error Handling

- **API Key Missing:** Clear error message displayed
- **API Errors:** Detailed error messages from OpenAI
- **Network Issues:** Graceful error handling with retry suggestions
- **Timeout:** 60-second timeout for API calls

## OpenAI API Key Setup

**Important:** The OpenAI API key must be configured for regeneration to work.

1. **Check current status:**
   ```bash
   cd dream-backend
   grep OPENAI_API_KEY .env
   ```

2. **Set your API key:**
   ```bash
   # Edit .env file
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Restart backend:**
   ```bash
   # If using uvicorn directly
   # Stop and restart the server
   
   # If using Docker
   docker-compose restart backend
   ```

4. **Get API key:**
   - Visit: https://platform.openai.com/api-keys
   - Create a new API key
   - Copy and paste into `.env` file

## Usage Tips

- **Regenerate failed dreams:** Use this for dreams that show "No image" or missing interpretations
- **Update interpretations:** Regenerate to get fresh AI analysis
- **Fix API errors:** If initial creation failed due to API issues, regenerate after fixing
- **Batch processing:** Regenerate multiple dreams one at a time from the list view

## Status Indicators

- **🔄 Regenerate** - Ready to regenerate
- **🔄 Processing...** - Currently regenerating
- **Error message** - Regeneration failed (check API key and logs)

## Troubleshooting

### Regeneration Not Working?

1. **Check API Key:**
   ```bash
   cd dream-backend
   cat .env | grep OPENAI_API_KEY
   ```
   Should show: `OPENAI_API_KEY=sk-...` (not the placeholder)

2. **Check Backend Logs:**
   - Look for error messages in terminal
   - Check for "OpenAI API key not configured" errors

3. **Verify API Key is Valid:**
   - Test with a simple curl request
   - Check OpenAI dashboard for usage/quota

4. **Check Network:**
   - Ensure backend can reach OpenAI API
   - Check firewall/proxy settings

### Images Still Not Showing?

1. **Wait for processing:** Regeneration takes 10-30 seconds
2. **Refresh page:** After regeneration completes
3. **Check image URL:** In browser console, check if URL is valid
4. **Verify DALL-E access:** Ensure your OpenAI account has DALL-E access

## Technical Details

- **Background Processing:** Uses FastAPI BackgroundTasks
- **WebSocket Updates:** Real-time status via WebSocket connection
- **Error Recovery:** Failed regenerations store error messages
- **Database:** Automatically updates interpretation records

---

**Need help?** Check the main README.md or SETUP_OPENAI.md for more details.

