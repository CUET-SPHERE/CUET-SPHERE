# OTP Verification Testing Guide

This document provides instructions for testing the OTP verification functionality for both signup and password reset flows in the CUET Sphere application using Postman.

## Setup

1. Make sure your backend server is running
2. Import the Postman collection from `CUET_Sphere_Admin_Postman_Collection.json` if you haven't already
3. Create a new folder in the collection called "OTP Verification"

## Testing Signup OTP Verification Flow

### 1. Request Signup OTP

**Endpoint:** `POST /auth/signup-otp`

**Request Body:**
```json
{
  "email": "testuser@student.cuet.ac.bd"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "email": "testuser@student.cuet.ac.bd"
}
```

### 2. Verify Signup OTP

**Endpoint:** `POST /auth/verify-signup-otp`

**Request Body:**
```json
{
  "email": "testuser@student.cuet.ac.bd",
  "otp": "123456"  // Replace with the actual OTP received in email
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

### 3. Complete Signup

**Endpoint:** `POST /auth/signup`

**Request Body:**
```json
{
  "fullName": "Test User",
  "email": "testuser@student.cuet.ac.bd",
  "password": "securePassword123",
  "hall": "Bangabandhu Sheikh Mujibur Rahman Hall",
  "bio": "This is a test user"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "fullName": "Test User",
  "email": "testuser@student.cuet.ac.bd",
  "role": "STUDENT",
  "studentId": "student_id_here",
  "batch": "batch_here",
  "department": "department_here",
  "hall": "Bangabandhu Sheikh Mujibur Rahman Hall"
}
```

## Testing Password Reset OTP Flow

### 1. Request Password Reset OTP

**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```json
{
  "email": "existinguser@student.cuet.ac.bd",
  "type": "password-reset"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset OTP sent successfully to your email"
}
```

### 2. Verify Password Reset OTP

**Endpoint:** `POST /auth/verify-otp`

**Request Body:**
```json
{
  "email": "existinguser@student.cuet.ac.bd",
  "otp": "123456",  // Replace with the actual OTP received in email
  "type": "password-reset"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "reset_token_here"
}
```

### 3. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "email": "existinguser@student.cuet.ac.bd",
  "resetToken": "reset_token_here",
  "newPassword": "newSecurePassword123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

## Testing Tips

1. **Check Email Delivery:** Ensure that the OTP emails are being delivered to your inbox. Check spam folders if necessary.

2. **OTP Expiration:** The OTP is likely configured to expire after a certain time period (commonly 5-15 minutes). Test this by waiting for the expiration period and then attempting to use the expired OTP.

3. **Invalid OTP:** Test with an incorrect OTP to ensure proper validation.

4. **Resend OTP:** Test the resend OTP functionality by requesting a new OTP for the same email.

5. **Concurrent OTPs:** Check if requesting a new OTP invalidates any previous OTP for the same email and type.

## Troubleshooting

If you encounter any issues with the OTP verification process, consider the following:

1. **Backend Logs:** Check the backend server logs for any exceptions or errors.

2. **Email Service:** Verify that the email service (Brevo) is properly configured and working.

3. **Network Issues:** Ensure that your network allows connections to the required services.

4. **Endpoint URLs:** Make sure you're using the correct endpoint URLs as specified in this guide.

5. **Request Headers:** Ensure your requests include the `Content-Type: application/json` header.

6. **CORS Issues:** If testing from a frontend different from the origin configured in the backend, you might encounter CORS issues.

If problems persist, review the implementation of the `AuthController`, `SignupService`, and related classes for any potential issues with the OTP generation, verification, or email sending processes.