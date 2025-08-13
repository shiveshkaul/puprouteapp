# Google OAuth Troubleshooting Steps

## Current Configuration (From Screenshots):

### Google Cloud Console:
- Client ID: 1025288110754-bg54rfg47eqgh6g0pd0h5c85i6j87te.apps.googleusercontent.com
- Authorized redirect URIs:
  - http://localhost:8081/callback
  - http://localhost:8080/callback  
  - http://localhost:8082/callback
  - https://bagpfxikrcjlajsqfjwg.supabase.co/auth/v1/callback

### Supabase Configuration:
- Google provider enabled ✅
- Client ID: 1025288110754-bg54rfg47eqgh6g0pd0h5c85i6j87te.apps.googleusercontent.com
- Client Secret: Configured ✅
- Callback URL: https://bagpfxikrcjlajsqfjwg.supabase.co/auth/v1/callback

## Issue Analysis:
The redirect_uri_mismatch error suggests that Google is receiving a redirect URI that doesn't match what's configured.

## Quick Fix Steps:

### 1. Update Google Console Redirect URIs
Add these EXACT URLs to your Google Console "Authorized redirect URIs":

```
https://bagpfxikrcjlajsqfjwg.supabase.co/auth/v1/callback
http://localhost:8082/auth/callback
http://localhost:3000/auth/callback
```

### 2. Save and Wait
- Click "Save" in Google Console
- Wait 5-10 minutes for changes to propagate

### 3. Test Again
- Try the Google login button again
- Check browser console for any error messages

## Alternative Test:
If still not working, try opening this URL directly in browser:
```
https://bagpfxikrcjlajsqfjwg.supabase.co/auth/v1/authorize?provider=google&redirect_to=http://localhost:8082/dashboard
```

## Debug Information:
When you click the Google login button, check:
1. Browser Network tab - what URL is being called?
2. Browser Console - any error messages?
3. What exact redirect_uri is being sent to Google?

## Common Solutions:
1. Remove ALL redirect URIs from Google Console, then add only the Supabase one
2. Make sure there are no trailing slashes
3. Ensure the Google project has the correct APIs enabled
4. Try creating a new OAuth client in Google Console
