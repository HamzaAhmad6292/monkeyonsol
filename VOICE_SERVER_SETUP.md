# Voice Server Setup for Production

## Issue
The speech-to-text and text-to-speech APIs are working locally but failing on Vercel with 500 errors.

## Root Cause
The environment variable for the voice server URL is not configured in Vercel, causing the API to try to connect to `localhost:8000` which is not accessible from Vercel's servers.

## Solution

### 1. Set Environment Variables in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`meme-token-landing`)
3. Go to **Settings** → **Environment Variables**
4. Add the following environment variable:

   **Name**: `RENDER_VOICE_SERVER_URL`
   **Value**: Your Render voice server URL (e.g., `https://your-voice-server.onrender.com`)
   **Environment**: Production (and Preview if needed)

### 2. Alternative Environment Variable Names

For backward compatibility, you can also use:
- `VOICE_SERVER_URL`
- `NEXT_PUBLIC_VOICE_SERVER_URL`

### 3. Verify Configuration

After setting the environment variable:
1. Redeploy your application on Vercel
2. Check the Vercel function logs to see if the voice server URL is being logged
3. Test the speech-to-text functionality

## Code Changes Made

The API routes have been updated to:
- Use `RENDER_VOICE_SERVER_URL` as the primary environment variable
- Provide better error messages when the voice server is not configured
- Add logging to help debug connection issues
- Validate the voice server URL before making requests

## Testing

1. **Local Development**: Should continue working with `http://localhost:8000`
2. **Production**: Should work once `RENDER_VOICE_SERVER_URL` is set in Vercel

## Troubleshooting

If you still get errors after setting the environment variable:
1. Check Vercel function logs for detailed error messages
2. Verify your Render voice server is accessible from external requests
3. Ensure the voice server endpoints are working (`/api/speech-to-text` and `/api/text-to-speech`)
