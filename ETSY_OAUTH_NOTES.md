# Etsy OAuth 2.0 Integration Notes

## Overview
Etsy Open API v3 uses OAuth 2.0 with Authorization Code Grant flow + PKCE.

## Required Setup
1. **Etsy App Credentials** (from Etsy Developer Portal)
   - API Key (keystring)
   - Shared Secret
   - Redirect URI (must be registered)

2. **OAuth Flow Steps**

### Step 1: Request Authorization Code
Redirect user to:
```
https://www.etsy.com/oauth/connect?
  response_type=code
  &client_id={API_KEY}
  &redirect_uri={REDIRECT_URI}
  &scope={SCOPES}
  &state={STATE}
  &code_challenge={CODE_CHALLENGE}
  &code_challenge_method=S256
```

### Step 2: User Grants Access
User approves on Etsy.com, then redirected back to:
```
{REDIRECT_URI}?code={AUTHORIZATION_CODE}&state={STATE}
```

### Step 3: Exchange Code for Access Token
POST to `https://api.etsy.com/v3/public/oauth/token`
Body (application/x-www-form-urlencoded):
```
grant_type=authorization_code
client_id={API_KEY}
redirect_uri={REDIRECT_URI}
code={AUTHORIZATION_CODE}
code_verifier={CODE_VERIFIER}
```

Response:
```json
{
  "access_token": "12345678.O1zLuwveeKjpIqCQFfmR...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "12345678.JNGIJtvLmwfDMhlYoOJl..."
}
```

## Token Details
- **Access Token**: Valid for 1 hour, includes user_id prefix
- **Refresh Token**: Valid for 90 days
- **User ID**: Numeric prefix in token (e.g., `12345678`)

## Required Scopes
For listing management:
- `listings_r` - Read listings
- `listings_w` - Write/update listings
- `shops_r` - Read shop data

## PKCE (Proof Key for Code Exchange)
Required for security:
1. Generate random `code_verifier` (43-128 chars)
2. Create `code_challenge` = BASE64URL(SHA256(code_verifier))
3. Send `code_challenge` in Step 1
4. Send `code_verifier` in Step 3

## Refresh Token Flow
POST to `https://api.etsy.com/v3/public/oauth/token`
Body:
```
grant_type=refresh_token
client_id={API_KEY}
refresh_token={REFRESH_TOKEN}
```

## Implementation Plan
1. Create Etsy app in developer portal
2. Store API key and secret in environment variables
3. Build OAuth callback route
4. Implement PKCE generation
5. Store tokens in database (Shop model)
6. Implement token refresh logic

