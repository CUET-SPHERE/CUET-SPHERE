# Brevo Email API Test Guide

## Required Environment Variables

Only these two variables are needed in your `.env` file:

```env
VITE_BREVO_API_KEY=your_brevo_api_key
VITE_BREVO_SENDER_EMAIL=your_verified_sender_email
```

## 1. Test Brevo API Connection (Manual Test)

### Using curl command:

```bash
curl -X POST \
  https://api.brevo.com/v3/smtp/email \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "api-key: YOUR_API_KEY_HERE" \
  -d '{
    "sender": {
      "name": "CUET Sphere Test",
      "email": "YOUR_SENDER_EMAIL_HERE"
    },
    "to": [
      {
        "email": "YOUR_TEST_EMAIL_HERE",
        "name": "Test User"
      }
    ],
    "subject": "Brevo API Test",
    "htmlContent": "<h1>Test Email</h1><p>If you receive this, Brevo is working!</p>"
  }'
```

### Using PowerShell (Windows):

```powershell
$headers = @{
    "Accept" = "application/json"
    "Content-Type" = "application/json"
    "api-key" = "YOUR_API_KEY_HERE"
}

$body = @{
    sender = @{
        name = "CUET Sphere Test"
        email = "YOUR_SENDER_EMAIL_HERE"
    }
    to = @(
        @{
            email = "YOUR_TEST_EMAIL_HERE"
            name = "Test User"
        }
    )
    subject = "Brevo API Test"
    htmlContent = "<h1>Test Email</h1><p>If you receive this, Brevo is working!</p>"
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "https://api.brevo.com/v3/smtp/email" -Method POST -Headers $headers -Body $body
```

## 2. Test Using Browser Console

Open your browser console on your frontend app and run:

```javascript
// Test Brevo API directly
const testBrevoAPI = async () => {
  const apiKey = 'YOUR_API_KEY_HERE';
  const senderEmail = 'YOUR_SENDER_EMAIL_HERE';
  const testEmail = 'YOUR_TEST_EMAIL_HERE';
  
  const emailData = {
    sender: {
      name: 'CUET Sphere Test',
      email: senderEmail
    },
    to: [{
      email: testEmail,
      name: 'Test User'
    }],
    subject: 'Brevo API Test from Browser',
    htmlContent: '<h1>Browser Test</h1><p>Brevo API is working from browser!</p>'
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(emailData)
    });

    const result = await response.json();
    console.log('Success:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Run the test
testBrevoAPI();
```

## 3. Test Using Your App's Email Service

Add this test component to your app temporarily:

```jsx
// Add to any page for testing
import EmailService from '../services/emailService';

const TestBrevoButton = () => {
  const testEmail = async () => {
    try {
      const result = await EmailService.sendPasswordResetEmail('your-test-email@gmail.com', '123456');
      console.log('Email sent successfully:', result);
      alert('Email sent! Check your inbox.');
    } catch (error) {
      console.error('Email failed:', error);
      alert('Email failed: ' + error.message);
    }
  };

  return (
    <button onClick={testEmail} className="bg-blue-500 text-white px-4 py-2 rounded">
      Test Brevo Email
    </button>
  );
};
```

## 4. Test the Complete Forget Password Flow

1. **Start your frontend server**: `npm run dev`
2. **Go to login page**: `http://localhost:5173/login`
3. **Click "Forgot Password?"**
4. **Enter your email** (use the same email as your sender email for testing)
5. **Click "Get OTP"**
6. **Check your email** for the OTP
7. **Enter the received OTP** on verification page
8. **Complete password reset**

## 5. Common Issues and Solutions

### Issue: "Invalid API key"
- **Solution**: Check your API key in Brevo dashboard → Settings → API Keys

### Issue: "Sender not verified"
- **Solution**: Go to Brevo dashboard → Senders & IP → Add and verify your sender email

### Issue: "CORS error in browser"
- **Solution**: This is normal for direct browser calls. Use the app's backend or test with curl/PowerShell

### Issue: "Email not received"
- **Check**: Spam folder, sender verification, API key validity

## 6. Verify Your Brevo Setup

1. **Login to Brevo**: https://app.brevo.com/
2. **Check API Key**: Settings → API Keys → Copy your key
3. **Verify Sender**: Senders & IP → Senders → Make sure your email is verified (green checkmark)
4. **Check Quota**: Dashboard → Check your email sending limits

## Expected Response Format

Successful API call returns:
```json
{
  "messageId": "<message-id-string>"
}
```

Error response:
```json
{
  "message": "Error description",
  "code": "error_code"
}
```

## Quick Test Command

Replace the placeholders and run this in your terminal:

```bash
# Windows PowerShell
$response = Invoke-RestMethod -Uri "https://api.brevo.com/v3/smtp/email" -Method POST -Headers @{"api-key"="YOUR_API_KEY";"Content-Type"="application/json"} -Body '{"sender":{"email":"YOUR_SENDER_EMAIL","name":"Test"},"to":[{"email":"YOUR_TEST_EMAIL"}],"subject":"Test","htmlContent":"<p>Test email</p>"}'
Write-Output $response
```

If you get a `messageId` in response, Brevo is working correctly!