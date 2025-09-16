# Postman Testing Guide for OTP Verification

This guide provides practical step-by-step instructions for setting up and executing tests for the OTP verification functionality in Postman.

## Prerequisites

1. [Postman](https://www.postman.com/downloads/) installed on your computer
2. CUET Sphere backend server running on localhost:5454 (or your configured port)
3. Basic familiarity with Postman

## Initial Setup

1. Open Postman and import the existing collection:
   - Click on "Import" in the top left
   - Select the file: `CUET_Sphere_Admin_Postman_Collection.json`
   - Click "Import" to add it to your collections

2. Create a new folder for OTP testing:
   - Right-click on the imported collection
   - Select "Add Folder"
   - Name it "OTP Verification"

3. Set up environment variables (for easier testing):
   - Click the "Environments" tab in Postman
   - Click "+" to create a new environment
   - Name it "CUET Sphere Local"
   - Add these variables:
     - `baseUrl`: `http://localhost:5454` (or your server URL)
     - `testEmail`: `testuser@student.cuet.ac.bd`
     - `existingEmail`: (an email for an account that already exists)
     - `otp`: (leave this empty for now)
     - `resetToken`: (leave this empty for now)
   - Click "Save"
   - Make sure to select this environment from the environment dropdown (top right)

## Creating Test Requests

### 1. Signup Flow - Request OTP

1. Create a new request in the OTP Verification folder:
   - Right-click the "OTP Verification" folder
   - Select "Add Request"
   - Name it "1. Request Signup OTP"

2. Configure the request:
   - Method: `POST`
   - URL: `{{baseUrl}}/auth/signup-otp`
   - Body tab: select "raw" and "JSON"
   - Enter this JSON:
     ```json
     {
       "email": "{{testEmail}}"
     }
     ```
   - Headers tab: Add `Content-Type: application/json`

3. Add tests to automatically extract the OTP (if visible in response):
   - Click on the "Tests" tab
   - Add this script:
     ```javascript
     // Test for successful response
     pm.test("Status code is 200", function() {
       pm.response.to.have.status(200);
     });
     
     pm.test("Success is true", function() {
       var jsonData = pm.response.json();
       pm.expect(jsonData.success).to.be.true;
     });
     
     // Check if OTP is included in response (for development)
     try {
       var jsonData = pm.response.json();
       if (jsonData.otp) {
         pm.environment.set("otp", jsonData.otp);
         console.log("OTP automatically extracted: " + jsonData.otp);
       }
     } catch (e) {}
     ```

4. Save the request

### 2. Signup Flow - Verify OTP

1. Create another request:
   - Name it "2. Verify Signup OTP"
   - Method: `POST`
   - URL: `{{baseUrl}}/auth/verify-signup-otp`
   - Body:
     ```json
     {
       "email": "{{testEmail}}",
       "otp": "{{otp}}"
     }
     ```
   - Headers: `Content-Type: application/json`

2. Add tests:
   ```javascript
   pm.test("Status code is 200", function() {
     pm.response.to.have.status(200);
   });
   
   pm.test("Success is true", function() {
     var jsonData = pm.response.json();
     pm.expect(jsonData.success).to.be.true;
   });
   ```

3. Save the request

### 3. Signup Flow - Complete Signup

1. Create another request:
   - Name it "3. Complete Signup"
   - Method: `POST`
   - URL: `{{baseUrl}}/auth/signup`
   - Body:
     ```json
     {
       "fullName": "Test User",
       "email": "{{testEmail}}",
       "password": "securePassword123",
       "hall": "Bangabandhu Sheikh Mujibur Rahman Hall",
       "bio": "This is a test user for API testing"
     }
     ```
   - Headers: `Content-Type: application/json`

2. Add tests:
   ```javascript
   pm.test("Status code is 201", function() {
     pm.response.to.have.status(201);
   });
   
   pm.test("User created successfully", function() {
     var jsonData = pm.response.json();
     pm.expect(jsonData.success).to.be.true;
     pm.expect(jsonData.token).to.not.be.empty;
     pm.expect(jsonData.email).to.equal(pm.environment.get("testEmail"));
     
     // Store token for subsequent requests if needed
     pm.environment.set("authToken", jsonData.token);
   });
   ```

3. Save the request

### 4. Password Reset Flow - Request OTP

1. Create a new request:
   - Name it "4. Request Password Reset OTP"
   - Method: `POST`
   - URL: `{{baseUrl}}/auth/forgot-password`
   - Body:
     ```json
     {
       "email": "{{existingEmail}}",
       "type": "password-reset"
     }
     ```

2. Add tests similar to the signup OTP request
3. Save the request

### 5. Password Reset Flow - Verify OTP

1. Create a new request:
   - Name it "5. Verify Password Reset OTP"
   - Method: `POST`
   - URL: `{{baseUrl}}/auth/verify-otp`
   - Body:
     ```json
     {
       "email": "{{existingEmail}}",
       "otp": "{{otp}}",
       "type": "password-reset"
     }
     ```

2. Add tests:
   ```javascript
   pm.test("Status code is 200", function() {
     pm.response.to.have.status(200);
   });
   
   pm.test("Success is true and reset token received", function() {
     var jsonData = pm.response.json();
     pm.expect(jsonData.success).to.be.true;
     pm.expect(jsonData.resetToken).to.not.be.empty;
     
     // Store reset token for the next request
     pm.environment.set("resetToken", jsonData.resetToken);
   });
   ```

3. Save the request

### 6. Password Reset Flow - Reset Password

1. Create a new request:
   - Name it "6. Reset Password"
   - Method: `POST`
   - URL: `{{baseUrl}}/auth/reset-password`
   - Body:
     ```json
     {
       "email": "{{existingEmail}}",
       "resetToken": "{{resetToken}}",
       "newPassword": "newSecurePassword123"
     }
     ```

2. Add tests to verify success
3. Save the request

## Running the Tests

### Signup Flow Testing

1. **Before starting**: Make sure your test email does not already exist in the system

2. **Request OTP**:
   - Run the "1. Request Signup OTP" request
   - Check for a 200 status and success message
   - Check your email for the OTP (or look for it in the server logs if in development mode)
   - Manually set the `otp` environment variable if needed:
     - Click the environment quick-look button (eye icon)
     - Edit the `otp` value to what you received
     - Click outside the field to save

3. **Verify OTP**:
   - Run the "2. Verify Signup OTP" request
   - Check for successful verification response

4. **Complete Signup**:
   - Run the "3. Complete Signup" request
   - Check for successful user creation and JWT token

### Password Reset Flow Testing

1. **Before starting**: Make sure to use an email that already exists in the system for `existingEmail`

2. Follow the same process as above for requests 4-6, making sure to update the OTP value when received

## Test Cases to Try

1. **Happy Path**:
   - Follow all steps in order with valid inputs
   
2. **Invalid OTP**:
   - Request an OTP
   - Try verifying with an incorrect OTP
   - Should receive an error
   
3. **Expired OTP**:
   - Request an OTP
   - Wait for 10+ minutes (or whatever your expiration period is)
   - Try verifying with the expired OTP
   - Should receive an expiration error

4. **Non-existent Email for Password Reset**:
   - Request a password reset OTP for an email that doesn't exist
   - Should still receive a success message (for security), but no email should be sent

5. **Existing Email for Signup**:
   - Try requesting a signup OTP for an email that already exists
   - Should receive an error indicating the email is taken

6. **Invalid Reset Token**:
   - Try resetting password with an invalid reset token
   - Should receive an error

## Debug Tips

1. **Check Server Logs**: 
   - The backend prints detailed logs about each OTP request and verification
   - Look for any errors or warnings

2. **Email Delivery**:
   - If OTPs aren't arriving, check your spam folder
   - Verify the Brevo API key is configured correctly
   - In development mode, the OTP might be printed to the console logs

3. **Network Tab**:
   - Use Postman's response details and the browser's Network tab to see the exact responses

4. **Authentication Issues**:
   - Ensure that protected endpoints include the JWT token in the Authorization header

Remember to be careful with this test data and avoid using real passwords or sensitive information during testing.