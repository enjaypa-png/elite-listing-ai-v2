# Etsy API Setup Guide

This guide will help you set up Etsy API credentials for Elite Listing AI.

## Prerequisites
- An Etsy account
- A shop on Etsy (or create one for testing)

## Step 1: Create an Etsy App

1. Go to [Etsy Developers](https://www.etsy.com/developers/)
2. Click "Register as a Developer" if you haven't already
3. Accept the API Terms of Use
4. Click "Create a New App" or "Apps You've Made" → "Create New App"

## Step 2: Configure Your App

Fill in the application form:

**App Name:** Elite Listing AI (or your preferred name)

**Tell us about your app:** 
```
Elite Listing AI is a listing optimization tool that helps Etsy sellers improve their product listings through AI-powered image analysis and text optimization.
```

**What's the URL for your app?**
```
http://localhost:3000
```
(For production, use your actual domain)

**Callback URL:**
```
http://localhost:3000/api/etsy/callback
```
(For production, use `https://yourdomain.com/api/etsy/callback`)

**Application Type:** Select "Web Application"

**Permissions Needed:**
- Read listings
- Write listings  
- Read shops
- Read transactions

## Step 3: Get Your Credentials

After creating the app, you'll see:
- **Keystring** (this is your API Key)
- **Shared Secret**

## Step 4: Add Credentials to Your Project

1. Open `.env.local` in your project root
2. Replace the placeholder values:

```env
ETSY_API_KEY="your_keystring_here"
ETSY_SHARED_SECRET="your_shared_secret_here"
ETSY_REDIRECT_URI="http://localhost:3000/api/etsy/callback"
```

3. Save the file
4. Restart your development server

## Step 5: Test the Integration

1. Start your app: `pnpm dev`
2. Sign in to your account
3. Click "Connect Shop" on the dashboard
4. You'll be redirected to Etsy to authorize the app
5. After authorization, you'll be redirected back to your dashboard
6. Your shop should now appear in the "Connected Shops" section

## Troubleshooting

### "Invalid redirect_uri"
- Make sure the callback URL in your Etsy app settings exactly matches `ETSY_REDIRECT_URI` in `.env.local`
- No trailing slashes
- Use `http://` for localhost, `https://` for production

### "Invalid API key"
- Double-check that you copied the Keystring correctly
- Make sure there are no extra spaces or quotes

### "Missing scopes"
- Verify that your app has the required permissions enabled in the Etsy developer portal

### "Token expired"
- The app automatically refreshes tokens
- If you see this error, try disconnecting and reconnecting your shop

## Production Deployment

When deploying to production:

1. Update your Etsy app settings:
   - Change the app URL to your production domain
   - Update the callback URL to `https://yourdomain.com/api/etsy/callback`

2. Update environment variables:
   ```env
   ETSY_API_KEY="your_keystring"
   ETSY_SHARED_SECRET="your_shared_secret"
   ETSY_REDIRECT_URI="https://yourdomain.com/api/etsy/callback"
   ```

3. Ensure your production environment uses HTTPS

## API Rate Limits

Etsy API v3 rate limits:
- 10 requests per second
- 10,000 requests per day

The app handles rate limiting automatically, but be aware of these limits when scaling.

## Support

For Etsy API issues:
- [Etsy API Documentation](https://developers.etsy.com/documentation)
- [Etsy Developer Forums](https://community.etsy.com/t5/Etsy-Developer-API/ct-p/developers)

For app-specific issues:
- Check the console logs for detailed error messages
- Verify your environment variables are set correctly

