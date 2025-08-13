# Google OAuth Setup Guide for PupRoute

## Issue: redirect_uri_mismatch error

The Google OAuth error occurs because the redirect URI in your Google Cloud Console doesn't match what Supabase expects.

## Steps to Fix:

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Select your project (or create a new one)

### 2. Enable Google+ API
- Go to "APIs & Services" → "Library"
- Search for "Google+ API" and enable it

### 3. Configure OAuth Consent Screen
- Go to "APIs & Services" → "OAuth consent screen"
- Fill in the required information:
  - App name: "PupRoute"
  - User support email: your email
  - Developer contact: your email

### 4. Create/Update OAuth 2.0 Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create credentials" → "OAuth 2.0 Client ID"
- Application type: "Web application"
- Name: "PupRoute Web Client"

### 5. Add Authorized Redirect URIs
Add these EXACT URLs to the "Authorized redirect URIs" section:

**For Production:**
```
https://bagpfxikrcjlajsqfjwg.supabase.co/auth/v1/callback
```

**For Development:**
```
http://localhost:8082/dashboard
http://localhost:3000/dashboard
http://localhost:5173/dashboard
```

### 6. Update Supabase Configuration
- Go to your Supabase dashboard
- Navigate to Authentication → Providers
- Enable Google provider
- Enter your Google OAuth Client ID and Client Secret

### 7. Test the Login
- The redirect URI that Supabase uses is: `https://bagpfxikrcjlajsqfjwg.supabase.co/auth/v1/callback`
- Make sure this EXACT URL is in your Google Console authorized redirect URIs

## Common Issues:
- **Case sensitivity**: URLs must match exactly
- **Protocol**: Use `https://` for production, `http://` for localhost
- **Trailing slashes**: Don't add trailing slashes unless specified
- **Port numbers**: Include the exact port for localhost URLs

## Verification:
After setup, the Google login should redirect properly and create a user session in Supabase.
