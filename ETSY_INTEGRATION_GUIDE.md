# Etsy Integration - Implementation Guide

## 🔧 Current Status: Mock Mode

The Etsy integration is fully scaffolded and ready for production. Currently using **mock data** while awaiting Etsy API approval.

## Architecture

### Abstraction Layer (`/lib/etsyClient.ts`)
- **Interface-based design** allows seamless switching between mock and real API
- `IEtsyClient` interface defines all Etsy operations
- `MockEtsyClient` - Returns simulated data (current)
- `RealEtsyClient` - Ready for production API keys (to be implemented)

### Mock Endpoints
- `GET /api/etsy/mock_connect` - Simulates OAuth connection
- `POST /api/etsy/mock_import` - Returns 25 fake listings
- `GET /api/etsy/mock_callback` - Handles OAuth callback simulation

### Frontend UI (`/app/etsy/page.tsx`)
- ✅ Connect/Disconnect Etsy shop
- ✅ Display shop info with icon
- ✅ Import listings button
- ✅ Full listings table with 25 mock items
- ✅ "Optimize This" button on each listing
- ✅ Status badges (active/draft)
- ✅ Views, favorites, price display
- ✅ Responsive design with design tokens

## Switching to Production

### Step 1: Obtain Etsy API Keys
1. Go to [Etsy Developer Portal](https://www.etsy.com/developers)
2. Create an application
3. Get your API Key (Keystring)
4. Configure OAuth redirect URI

### Step 2: Update Environment Variables
```bash
# In .env.local or Vercel
USE_MOCK_ETSY="false"  # Switch to real API
ETSY_API_KEY="your_actual_api_key_here"
ETSY_REDIRECT_URI="https://yourdomain.com/api/etsy/callback"
```

### Step 3: Implement Real Client
In `/lib/etsyClient.ts`, complete the `RealEtsyClient` class:

```typescript
class RealEtsyClient implements IEtsyClient {
  private apiKey: string
  private redirectUri: string
  private baseUrl = 'https://openapi.etsy.com/v3'

  async getAuthorizationUrl(userId: string): Promise<string> {
    // Implement PKCE flow
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    
    // Store codeVerifier in session/database
    
    const params = new URLSearchParams({
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: 'listings_r listings_w',
      client_id: this.apiKey,
      state: userId,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    })
    
    return `https://www.etsy.com/oauth/connect?${params}`
  }

  async exchangeCodeForToken(code: string, codeVerifier: string): Promise<EtsyTokens> {
    const response = await fetch(`${this.baseUrl}/public/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.apiKey,
        redirect_uri: this.redirectUri,
        code: code,
        code_verifier: codeVerifier
      })
    })
    
    const data = await response.json()
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000
    }
  }

  async getShop(accessToken: string): Promise<EtsyShop> {
    const response = await fetch(`${this.baseUrl}/application/users/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-api-key': this.apiKey
      }
    })
    
    const data = await response.json()
    // Map Etsy response to EtsyShop interface
  }

  async getShopListings(accessToken: string, shopId: number, limit = 25): Promise<EtsyListing[]> {
    const response = await fetch(
      `${this.baseUrl}/application/shops/${shopId}/listings/active?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-api-key': this.apiKey
        }
      }
    )
    
    const data = await response.json()
    return data.results // Map to EtsyListing[]
  }
}
```

### Step 4: Update Callback Endpoint
Replace `/api/etsy/mock_callback` with real OAuth callback:

```typescript
// /app/api/etsy/callback/route.ts
export async function GET(request: NextRequest) {
  const code = searchParams.get('code')
  const state = searchParams.get('state') // userId
  
  // Retrieve codeVerifier from session/database
  const codeVerifier = await getCodeVerifier(state)
  
  // Exchange code for tokens
  const tokens = await etsyClient.exchangeCodeForToken(code, codeVerifier)
  
  // Store tokens in database
  await storeTokens(state, tokens)
  
  // Redirect to dashboard
  return NextResponse.redirect('/dashboard?etsy_connected=true')
}
```

### Step 5: Test Production Flow
1. Navigate to `/etsy`
2. Click "Connect Etsy Shop"
3. User redirected to Etsy OAuth page
4. Authorize app
5. Redirected back to your app
6. Import listings button fetches real data

## Data Structures

All mock data follows **real Etsy API v3 response format**:

```typescript
interface EtsyListing {
  listing_id: number
  title: string
  description: string
  price: string
  currency_code: string
  quantity: number
  state: 'active' | 'draft' | 'inactive'
  tags: string[]
  images: Array<{
    url_570xN: string
    url_fullxfull: string
  }>
  views: number
  num_favorers: number
  created_timestamp: number
  url: string
}
```

## Security Notes

- Store `access_token` and `refresh_token` securely in database
- Never expose tokens to client-side code
- Implement token refresh logic (Etsy tokens expire after 3600 seconds)
- Use PKCE flow for OAuth security
- Store `code_verifier` server-side during OAuth flow

## Testing

```bash
# Test mock connect
curl http://localhost:3000/api/etsy/mock_connect?user_id=test123

# Test mock import
curl -X POST http://localhost:3000/api/etsy/mock_import \
  -H "Content-Type: application/json" \
  -d '{"access_token":"test","shop_id":12345678,"limit":25}'
```

## What's Ready

✅ Full UI flow (connect → import → optimize)
✅ Mock API endpoints returning realistic data
✅ Interface abstraction for easy swap
✅ 25 mock listings with various states
✅ Listings table with all metadata
✅ "Optimize This" button integration
✅ Success/error states
✅ Loading indicators

## What's Needed

⏳ Real Etsy API keys from approval
⏳ Implement `RealEtsyClient` methods
⏳ Token storage in database
⏳ Token refresh logic
⏳ Update callback endpoint
⏳ Production testing with real shop

---

**Once API keys are approved, the swap takes ~1-2 hours of development.**
