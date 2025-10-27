# OpenAI API Setup Guide

This guide will help you set up OpenAI API access for the image analysis feature in Elite Listing AI.

## Prerequisites

- An OpenAI account (sign up at https://platform.openai.com/)
- Payment method added to your OpenAI account
- API credits or billing enabled

## Step 1: Get Your API Key

1. Go to https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Give it a name (e.g., "Elite Listing AI")
4. Copy the API key (it starts with `sk-`)
5. **Important:** Save it securely - you won't be able to see it again

## Step 2: Add API Key to Environment

Add the following line to your `.env.local` file:

```env
OPENAI_API_KEY="sk-your-api-key-here"
```

## Step 3: Verify Setup

1. Restart your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to http://localhost:3000/analyze

3. Enter a product image URL (e.g., from Unsplash)

4. Click "Analyze Image"

5. You should see detailed AI analysis results within 5-10 seconds

## Models Used

The image analysis feature uses **GPT-4 Vision** (`gpt-4o` model) for:
- Product photo quality assessment
- Technical compliance checking
- Platform-specific optimization recommendations

## Cost Estimates

- **GPT-4 Vision**: ~$0.01-0.03 per image analysis
- Based on image size and response length
- Check current pricing: https://openai.com/pricing

## Troubleshooting

### "OpenAI API key not configured"
- Make sure `OPENAI_API_KEY` is in `.env.local`
- Restart the dev server after adding the key

### "Insufficient quota" or "Rate limit exceeded"
- Add a payment method to your OpenAI account
- Check your usage limits at https://platform.openai.com/usage

### "Model not found" error
- Verify your account has access to GPT-4 Vision
- New accounts may need to add billing first
- Try the OpenAI Playground to test model access

## Security Best Practices

1. **Never commit `.env.local` to Git**
   - Already in `.gitignore`
   - Never share your API key publicly

2. **Use environment variables in production**
   - Set `OPENAI_API_KEY` in Vercel/deployment platform
   - Don't hardcode keys in source code

3. **Monitor usage**
   - Set up usage limits in OpenAI dashboard
   - Review billing regularly

4. **Rotate keys if compromised**
   - Delete old keys immediately
   - Generate new ones from the dashboard

## Production Deployment

When deploying to Vercel or other platforms:

1. Go to your project settings
2. Add environment variable:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
3. Redeploy your application

## API Rate Limits

OpenAI enforces rate limits based on your account tier:

- **Free tier**: Very limited (not recommended for production)
- **Pay-as-you-go**: 3,500 requests per minute (RPM) for GPT-4
- **Enterprise**: Custom limits

For production use, consider:
- Implementing request queuing
- Adding rate limiting on your API routes
- Caching analysis results in the database

## Support

- OpenAI Documentation: https://platform.openai.com/docs
- OpenAI Community: https://community.openai.com/
- Elite Listing AI Issues: https://github.com/enjaypa-png/Elite-Listing-AI/issues

---

**Ready to analyze images?** Add your API key and start optimizing your product photos! 🚀

