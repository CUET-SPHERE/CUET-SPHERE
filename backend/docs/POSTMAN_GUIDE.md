# Postman Guide for Cuet Sphere API

This guide will help you test the authentication and notices endpoints using Postman.

## Prerequisites

1. **Postman installed** on your machine
2. **Spring Boot application running** on `http://localhost:8080`
3. **Database with at least one user** (you can create one using the signup endpoint)

## Step 1: Test the Signin Endpoint

### 1.1 Create a Signin Request

1. **Open Postman** and create a new request
2. **Set the request type** to `POST`
3. **Set the URL** to: `http://localhost:8080/auth/signin`
4. **Go to Headers tab** and add:
   - Key: `Content-Type`
   - Value: `application/json`

### 1.2 Set Request Body

1. **Go to Body tab**
2. **Select "raw"** and **"JSON"** from the dropdown
3. **Enter the following JSON** (replace with your actual user credentials):

```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

### 1.3 Send the Request

1. **Click "Send"**
2. **Expected Response** (200 OK):

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "success": true,
  "message": "Signin successful",
  "email": "your-email@example.com",
  "fullName": "Your Full Name",
  "role": "STUDENT"
}
```

### 1.4 Copy the JWT Token

1. **Copy the entire token value** from the response
2. **This token will be used for authenticated requests**

## Step 2: Set Up Environment Variables (Recommended)

### 2.1 Create Environment

1. **Click the gear icon** (⚙️) in the top right corner of Postman
2. **Click "Add"** to create a new environment
3. **Name it** "Cuet Sphere API"
4. **Add the following variables**:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseUrl` | `http://localhost:8080` | `http://localhost:8080` |
| `authToken` | (leave empty) | (leave empty) |

### 2.2 Set the Token

1. **After successful signin**, copy the token from the response
2. **Go to the environment variables**
3. **Set `authToken`** to your copied token value
4. **Save the environment**

## Step 3: Test the Notices Endpoint

### 3.1 Create a Notices Request

1. **Create a new request**
2. **Set the request type** to `GET`
3. **Set the URL** to: `{{baseUrl}}/api/notices`
4. **Go to Headers tab** and add:
   - Key: `Authorization`
   - Value: `Bearer {{authToken}}`

### 3.2 Send the Request

1. **Click "Send"**
2. **Expected Response** (200 OK):

```json
[
  {
    "id": 1,
    "title": "Sample Notice",
    "content": "This is a sample notice content",
    "noticeType": "GENERAL",
    "sender": {
      "id": 1,
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-01T10:00:00",
    "isRead": false
  }
]
```

## Step 4: Test Other Notices Endpoints

### 4.1 Get Notices by Type

- **URL**: `{{baseUrl}}/api/notices/type/general`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {{authToken}}`

### 4.2 Get My Notices (Notices I Created)

- **URL**: `{{baseUrl}}/api/notices/my`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {{authToken}}`

### 4.3 Get Notice by ID

- **URL**: `{{baseUrl}}/api/notices/1`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {{authToken}}`

### 4.4 Create a New Notice

- **URL**: `{{baseUrl}}/api/notices`
- **Method**: `POST`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{authToken}}`
- **Body**:
```json
{
  "title": "New Notice Title",
  "content": "This is the content of the new notice",
  "noticeType": "GENERAL",
  "recipients": ["user1@example.com", "user2@example.com"]
}
```

## Troubleshooting

### Issue: "User not authenticated" Error

**Symptoms**: You get a 400 error with message "User not authenticated"

**Possible Causes and Solutions**:

1. **Missing Authorization Header**
   - Ensure you have `Authorization: Bearer {{authToken}}` in your headers
   - Check that the token is not empty

2. **Invalid Token**
   - The token might be expired (tokens expire after 24 hours)
   - Re-authenticate using the signin endpoint
   - Copy the new token and update your environment variable

3. **Malformed Token**
   - Ensure the token starts with "Bearer " (note the space)
   - Check that the token is complete and not truncated

4. **User Not Found**
   - The user associated with the token might have been deleted
   - Re-authenticate with valid credentials

### Issue: "Bad Credentials" Error

**Symptoms**: Signin returns "Invalid email or password"

**Solutions**:
1. **Check your credentials** - ensure email and password are correct
2. **Create a new user** using the signup endpoint if you don't have one
3. **Check the database** to ensure the user exists

### Issue: CORS Error

**Symptoms**: Browser shows CORS-related errors

**Solutions**:
1. **Use Postman** instead of browser-based tools
2. **Check that the application is running** on the correct port
3. **Verify the base URL** is correct

## Testing Checklist

- [ ] Application is running on `http://localhost:8080`
- [ ] Signin endpoint works and returns a valid token
- [ ] Token is properly stored in environment variables
- [ ] Authorization header is set correctly
- [ ] Notices endpoints return proper responses
- [ ] Error handling works as expected

## Sample Postman Collection

You can import this collection structure:

```json
{
  "info": {
    "name": "Cuet Sphere API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Signin",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"your-email@example.com\",\n  \"password\": \"your-password\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/signin",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "signin"]
            }
          }
        }
      ]
    },
    {
      "name": "Notices",
      "item": [
        {
          "name": "Get All Notices",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/notices",
              "host": ["{{baseUrl}}"],
              "path": ["api", "notices"]
            }
          }
        }
      ]
    }
  ]
}
```

## Security Notes

1. **Never share your JWT tokens** - they contain sensitive information
2. **Tokens expire after 24 hours** - you'll need to re-authenticate
3. **Use HTTPS in production** - JWT tokens should be transmitted securely
4. **Store tokens securely** - don't commit them to version control
