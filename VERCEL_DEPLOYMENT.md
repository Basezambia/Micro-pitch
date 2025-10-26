# Vercel Deployment Configuration

## Environment Variables Setup

To fix the "SDK not initialized" and "Project ID is required" errors on Vercel, you need to configure the following environment variables in your Vercel dashboard:

### Required Environment Variables

1. **NEXT_PUBLIC_CDP_PROJECT_ID**
   - Description: Coinbase CDP (Customer Data Platform) Project ID
   - How to get: 
     - Go to [Coinbase CDP Portal](https://portal.cdp.coinbase.com/)
     - Create or select your project
     - Copy the Project ID from your project dashboard
   - Example: `your-actual-project-id-here`

2. **DATABASE_URL**
   - Description: MongoDB connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database`

3. **NEXTAUTH_SECRET**
   - Description: Secret key for NextAuth.js authentication
   - Generate: Use `openssl rand -base64 32` or any secure random string generator
   - Example: `your-secure-random-string-here`

4. **NEXTAUTH_URL**
   - Description: The canonical URL of your site
   - For Vercel: `https://your-app-name.vercel.app`

5. **OPENAI_API_KEY** (if using AI features)
   - Description: OpenAI API key for AI analysis
   - How to get: From [OpenAI API Dashboard](https://platform.openai.com/api-keys)

6. **PINATA_JWT** (if using IPFS features)
   - Description: Pinata JWT token for IPFS uploads
   - How to get: From [Pinata Dashboard](https://app.pinata.cloud/)

### How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" tab
4. Click on "Environment Variables" in the sidebar
5. Add each variable with the following settings:
   - **Name**: Variable name (e.g., `NEXT_PUBLIC_CDP_PROJECT_ID`)
   - **Value**: The actual value
   - **Environment**: Select "Production", "Preview", and "Development" as needed

### Important Notes

- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Make sure `NEXT_PUBLIC_CDP_PROJECT_ID` is set correctly as it's required for the Coinbase SDK
- After adding environment variables, redeploy your application
- The error handling we added will show a user-friendly message if the CDP Project ID is missing

### Troubleshooting

If you're still getting errors after setting environment variables:

1. **Check Variable Names**: Ensure they match exactly (case-sensitive)
2. **Redeploy**: Environment variables only take effect after redeployment
3. **Check Logs**: Use Vercel's function logs to see detailed error messages
4. **Test Locally**: Verify your `.env` file works locally first

### Local Development

For local development, make sure your `.env` file contains all the required variables:

```env
DATABASE_URL="your-mongodb-connection-string"
NEXTAUTH_SECRET="your-secure-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_CDP_PROJECT_ID="your-cdp-project-id"
OPENAI_API_KEY="your-openai-api-key"
PINATA_JWT="your-pinata-jwt-token"
```

## Next Steps

1. Set up your Coinbase CDP project and get the Project ID
2. Add all environment variables to Vercel
3. Redeploy your application
4. Test the deployment to ensure the errors are resolved

The application now includes error handling that will show a helpful message if the CDP Project ID is missing, preventing the application from crashing.