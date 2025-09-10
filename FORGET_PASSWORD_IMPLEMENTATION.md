# Forget Password Implementation - Complete Guide

## 🎯 Overview

Complete forget password functionality has been implemented with:
- ✅ **Frontend UI** with modal, OTP verification, and password reset pages
- ✅ **Backend API** with OTP generation, validation, and expiration handling
- ✅ **Email Integration** using Brevo for sending OTPs
- ✅ **Database Management** with automatic cleanup of expired OTPs
- ✅ **Security Features** including rate limiting and password validation

## 🏗️ Architecture

### Frontend Components
```
LoginPage.jsx (Updated)
├── ForgotPasswordModal.jsx (New)
├── VerifyOtpPage.jsx (New)
└── ResetPasswordPage.jsx (New)
```

### Backend Components
```
AuthController.java (Updated)
├── PasswordResetService.java (New)
├── EmailService.java (New)
├── PasswordResetOtp.java (New Entity)
├── PasswordResetOtpRepository.java (New)
└── DTOs: ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest
```

## 🔄 Complete Flow

### 1. User Requests Password Reset
- User clicks "Forgot Password?" on login page
- Modal opens asking for email
- Frontend calls `/auth/forgot-password`
- Backend validates email and generates 6-digit OTP
- OTP saved to database with 10-minute expiration
- Email sent via Brevo with OTP

### 2. OTP Verification
- User redirected to OTP verification page
- Enters 6-digit OTP received via email
- Frontend calls `/auth/verify-otp`
- Backend validates OTP and marks as used
- Returns reset token (UUID) for next step

### 3. Password Reset
- User redirected to password reset page
- Enters new password with confirmation
- Frontend calls `/auth/reset-password`
- Backend validates token and password strength
- Updates user password and cleans up OTPs

## 🛡️ Security Features

### Rate Limiting
- Maximum 5 OTP requests per email per hour
- Prevents spam and abuse

### OTP Security
- 6-digit secure random OTP
- 10-minute expiration time
- Single-use only (marked as used after verification)
- Automatic cleanup of expired OTPs

### Password Validation
- Minimum 8 characters
- Must contain uppercase, lowercase, and number
- Validated on both frontend and backend

### Token Security
- UUID-based reset tokens
- Tokens are single-use
- All OTPs cleaned up after successful password reset

## 📧 Email Configuration

### Required Environment Variables

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5454
VITE_BREVO_API_KEY=your_brevo_api_key
VITE_BREVO_SENDER_EMAIL=your_verified_sender_email
```

**Backend (application.properties or environment):**
```properties
brevo.api.key=your_brevo_api_key
brevo.sender.email=your_verified_sender_email
brevo.sender.name=CUET Sphere
```

### Brevo Setup Steps
1. Sign up at https://www.brevo.com/
2. Get API key from Settings → API Keys
3. Verify sender email in Senders & IP → Senders
4. Add credentials to environment variables

## 🗄️ Database Schema

### New Table: `password_reset_otps`
```sql
CREATE TABLE password_reset_otps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at DATETIME NULL,
    INDEX idx_email_otp (email, otp),
    INDEX idx_expires_at (expires_at)
);
```

## 🔌 API Endpoints

### 1. Request Password Reset
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@student.cuet.ac.bd"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with this email exists, you will receive an OTP shortly."
}
```

### 2. Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@student.cuet.ac.bd",
  "otp": "123456",
  "type": "password-reset"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "uuid-reset-token"
}
```

### 3. Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "email": "user@student.cuet.ac.bd",
  "resetToken": "uuid-reset-token",
  "newPassword": "NewPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## 🧹 Automatic Cleanup

### Scheduled Tasks
- **Hourly cleanup** of expired OTPs (runs automatically)
- **Manual cleanup** endpoint for admins: `POST /auth/admin/cleanup-otps`
- **Statistics endpoint** for monitoring: `GET /auth/admin/otp-stats`

### Cleanup Triggers
- Expired OTPs (older than 10 minutes)
- Used OTPs after successful password reset
- All OTPs for email after successful password reset

## 🧪 Testing

### Frontend Testing
1. Start frontend: `npm run dev`
2. Go to login page: `http://localhost:5173/login`
3. Click "Forgot Password?"
4. Test complete flow

### Backend Testing
1. Use the provided `test-password-reset.http` file
2. Test with Postman or similar tool
3. Check database for OTP records
4. Verify email delivery

### Test Cases Covered
- ✅ Valid email password reset flow
- ✅ Invalid email handling
- ✅ OTP expiration
- ✅ Invalid OTP format
- ✅ Rate limiting
- ✅ Password strength validation
- ✅ Database cleanup

## 🚀 Deployment Checklist

### Frontend
- [ ] Set production Brevo API key in `.env`
- [ ] Set production API URL in `.env`
- [ ] Build and deploy frontend

### Backend
- [ ] Set Brevo credentials in production environment
- [ ] Ensure database migrations run
- [ ] Configure email templates for production
- [ ] Set up monitoring for OTP statistics

### Email Service
- [ ] Verify sender email in Brevo production account
- [ ] Test email delivery in production
- [ ] Set up email monitoring/logging

## 🔍 Monitoring & Maintenance

### Key Metrics to Monitor
- OTP generation rate
- OTP verification success rate
- Email delivery success rate
- Failed password reset attempts
- Database cleanup efficiency

### Regular Maintenance
- Monitor OTP table size
- Check email delivery logs
- Review rate limiting effectiveness
- Update email templates as needed

## 🐛 Troubleshooting

### Common Issues

**Email not received:**
- Check spam folder
- Verify sender email in Brevo
- Check API key validity
- Review Brevo dashboard for delivery status

**OTP validation fails:**
- Check OTP expiration (10 minutes)
- Verify OTP format (6 digits)
- Check if OTP was already used

**Rate limiting triggered:**
- Wait 1 hour or use admin cleanup endpoint
- Check for potential abuse

**Database issues:**
- Verify table creation
- Check database connectivity
- Review cleanup job logs

## 📝 Code Quality

### Security Best Practices Implemented
- ✅ Input validation on all endpoints
- ✅ Rate limiting to prevent abuse
- ✅ Secure OTP generation using SecureRandom
- ✅ Password strength validation
- ✅ No sensitive data in logs
- ✅ Proper error handling without information leakage

### Performance Optimizations
- ✅ Database indexes on frequently queried columns
- ✅ Automatic cleanup to prevent table bloat
- ✅ Efficient OTP lookup queries
- ✅ Minimal email template size

This implementation provides a robust, secure, and user-friendly password reset system that follows industry best practices and integrates seamlessly with the existing CUET Sphere application.