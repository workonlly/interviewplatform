# Vapi AI Setup Guide for prep.ii

## 🎯 Overview
Your `/talk` page is ready to work with Vapi AI for voice interviews, but you need to configure the environment variables.

## 🔧 Setup Steps

### 1. Get Vapi AI Credentials
1. Go to [Vapi Dashboard](https://dashboard.vapi.ai)
2. Sign up or log in
3. Get your **Public Key** from the dashboard
4. Create an **Assistant** and get its ID

### 2. Configure Environment Variables
Create a `.env.local` file in your project root:

```env
# Vapi AI Configuration
NEXT_PUBLIC_VAPI_PUBLIC_KEY=sk_live_your_actual_public_key_here
NEXT_PUBLIC_VAPI_ASSISTANT=your_actual_assistant_id_here

# Your existing Firebase config
FIREBASE_PROJECT_ID=preppii-191fd
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
```

### 3. Test the Setup
1. Visit `/vapi-test` to check if your environment variables are set correctly
2. Visit `/talk` to start an interview

## 🔍 Troubleshooting

### Common Issues:

1. **"Configuration Error"**: Missing environment variables
   - Solution: Create `.env.local` file with proper values

2. **"Initialization Failed"**: Invalid credentials
   - Solution: Double-check your Vapi public key and assistant ID

3. **No response from assistant**: Assistant not configured properly
   - Solution: Check your assistant setup in Vapi dashboard

### Debug Pages:
- `/vapi-test` - Test your Vapi configuration
- Check browser console for detailed error messages

## 🎤 How It Works

1. User clicks "Start an Interview" → navigates to `/talk`
2. Vapi initializes with your credentials
3. Voice call starts with your AI assistant
4. Real-time transcription shows in two panels:
   - Left: Assistant's responses
   - Right: User's speech
5. Interview summary saved to localStorage when finished

## 📝 Features Working:
- ✅ Real-time voice transcription
- ✅ Dual transcript display (user + assistant)
- ✅ Interview summary saving
- ✅ Error handling and status updates
- ✅ Proper cleanup on page exit

## 🚀 Next Steps:
1. Set up your Vapi credentials
2. Configure your AI assistant with interview questions
3. Test the interview flow
4. Customize assistant responses for your use case
