# System Admin Guide - CUET Sphere

This guide explains how to set up and use the system admin functionality in CUET Sphere, including how to use Postman for testing.

## 🎯 **Overview**

The system admin is a special user who has full access to all system features and can manage CR (Class Representative) roles. The system admin is identified by a predefined student email address.

## ⚙️ **Configuration**

### **System Admin Email**
The system admin email is configured in `application.properties`:
```properties
system.admin.email=u2204001@student.cuet.ac.bd
```

**Important Notes:**
- The system admin email MUST be a valid CUET student email format
- The email format is: `u{batch}{department}{studentId}@student.cuet.ac.bd`
- Example: `u2204001@student.cuet.ac.bd` (Batch 22, Department 04, Student ID 001)
- You can change this email in the properties file before starting the application

## 🚀 **Setup Instructions**

### **Step 1: Configure System Admin Email**
1. Open `src/main/resources/application.properties`
2. Change the `system.admin.email` value to your desired admin email
3. Make sure the email follows the CUET student email format

### **Step 2: Create System Admin User**
1. Start the application
2. Use the signup endpoint to create a user with the system admin email
3. The user will automatically get the `STUDENT` role
4. Manually update the database to set the role to `SYSTEM_ADMIN`

### **Step 3: Database Update (Manual)**
```sql
UPDATE users SET u_role = 'SYSTEM_ADMIN' WHERE u_email = 'u2204001@student.cuet.ac.bd';
```

## 📱 **Postman Testing Guide**

### **Collection Setup**
1. Create a new Postman collection called "CUET Sphere Admin"
2. Set the base URL: `http://localhost:5454`
3. Create environment variables:
   - `baseUrl`: `http://localhost:5454`
   - `authToken`: (leave empty initially)

### **1. User Signup (Create System Admin)**
```
POST {{baseUrl}}/api/auth/signup
Content-Type: application/json

{
  "fullName": "System Administrator",
  "email": "u2204001@student.cuet.ac.bd",
  "password": "admin123",
  "hall": "Admin Hall",
  "bio": "System Administrator for CUET Sphere"
}
```

**Note:** The `batch`, `department`, and `studentId` are automatically extracted from the email address.

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "fullName": "System Administrator",
    "email": "u2204001@student.cuet.ac.bd",
    "role": "STUDENT"
  }
}
```

### **2. User Login (Get JWT Token)**
```
POST {{baseUrl}}/api/auth/signin
Content-Type: application/json

{
  "email": "u2204001@student.cuet.ac.bd",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "fullName": "System Administrator",
    "email": "u2204001@student.cuet.ac.bd",
    "role": "STUDENT"
  }
}
```

**Important:** Copy the `token` value and set it as the `authToken` environment variable.

### **3. Update User Role to SYSTEM_ADMIN (Database)**
After login, manually update the database:
```sql
UPDATE users SET u_role = 'SYSTEM_ADMIN' WHERE u_email = 'u2204001@student.cuet.ac.bd';
```

### **4. Test System Admin Access**
```
GET {{baseUrl}}/api/admin/system-info
Authorization: Bearer {{authToken}}
```

**Expected Response:**
```json
{
  "systemAdminEmail": "u2204001@student.cuet.ac.bd",
  "message": "System information retrieved successfully"
}
```

## 🔐 **System Admin API Endpoints**

### **Authentication Header**
All admin endpoints require the Authorization header:
```
Authorization: Bearer {{authToken}}
```

### **1. CR Role Assignment**
```
POST {{baseUrl}}/api/admin/assign-cr
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "userEmail": "u2204015@student.cuet.ac.bd",
  "department": "04",
  "batch": "22"
}
```

**Response:**
```json
{
  "message": "CR role assigned successfully",
  "userEmail": "u2204015@student.cuet.ac.bd",
  "department": "04",
  "batch": "22",
  "role": "CR",
  "success": true
}
```

### **2. CR Role Removal**
```
DELETE {{baseUrl}}/api/admin/remove-cr/u2204015@student.cuet.ac.bd
Authorization: Bearer {{authToken}}
```

**Response:**
```json
{
  "message": "CR role removed successfully",
  "userEmail": "u2204015@student.cuet.ac.bd",
  "department": "04",
  "batch": "22",
  "role": "STUDENT",
  "success": true
}
```

### **3. Get All Users**
```
GET {{baseUrl}}/api/admin/users
Authorization: Bearer {{authToken}}
```

### **4. Get Users by Department and Batch**
```
GET {{baseUrl}}/api/admin/users/department/04/batch/22
Authorization: Bearer {{authToken}}
```

### **5. Get User by Email**
```
GET {{baseUrl}}/api/admin/users/u2204015@student.cuet.ac.bd
Authorization: Bearer {{authToken}}
```

### **6. Get System Information**
```
GET {{baseUrl}}/api/admin/system-info
Authorization: Bearer {{authToken}}
```

## 🧪 **Complete Postman Workflow**

### **Step-by-Step Testing**

1. **Start Application**
   - Ensure the Spring Boot application is running on port 5454

2. **Create System Admin User**
   - Use the signup endpoint with the configured admin email
   - Verify the user is created successfully

3. **Update Database Role**
   - Manually set the user role to `SYSTEM_ADMIN` in the database

4. **Login and Get Token**
   - Use the signin endpoint to get a JWT token
   - Copy the token to the `authToken` environment variable

5. **Test Admin Access**
   - Try accessing `/api/admin/system-info` with the token
   - Verify you get a successful response

6. **Test CR Management**
   - Create a test user (regular student)
   - Assign CR role to the test user
   - Verify the role change
   - Remove CR role from the test user
   - Verify the role is reverted

7. **Test User Management**
   - Get all users
   - Filter users by department and batch
   - Get specific user details

## ⚠️ **Important Notes**

### **Security Considerations**
- Only users with `SYSTEM_ADMIN` role can access admin endpoints
- JWT tokens expire, so you may need to re-login periodically
- All admin operations are logged for audit purposes

### **Email Format Validation**
- All emails must follow the CUET student email format
- The system automatically parses batch, department, and student ID from emails
- Invalid email formats will result in errors

### **Role Hierarchy**
1. **STUDENT**: Basic user with limited access
2. **CR**: Class Representative with notice creation privileges
3. **SYSTEM_ADMIN**: Full system access and user management

## 🔧 **Troubleshooting**

### **Common Issues**

1. **"Access denied: Only system administrators can..."**
   - Ensure the user has `SYSTEM_ADMIN` role in the database
   - Verify the JWT token is valid and not expired

2. **"User not found with email..."**
   - Check if the user exists in the database
   - Verify the email format is correct

3. **"User is not in the specified department/batch combination"**
   - Ensure the user's department and batch match the request
   - Check the user's profile information

4. **"User is already a CR"**
   - The user already has CR role
   - Use the remove endpoint first if you want to reassign

### **Database Queries for Debugging**

```sql
-- Check user roles
SELECT u_email, u_role FROM users;

-- Find system admin
SELECT * FROM users WHERE u_role = 'SYSTEM_ADMIN';

-- Check specific user
SELECT * FROM users WHERE u_email = 'u2204015@student.cuet.ac.bd';

-- Update user role (if needed)
UPDATE users SET u_role = 'SYSTEM_ADMIN' WHERE u_email = 'u2204001@student.cuet.ac.bd';
```

## 📚 **Additional Resources**

- **Notice System**: `/api/notices` endpoints for CR operations
- **WebSocket**: Real-time notice delivery at `/ws`
- **Test Pages**: 
  - Notice testing: `http://localhost:5454/notice-test.html`
  - Admin testing: `http://localhost:5454/admin-test.html`

## 🎉 **Success Indicators**

You've successfully set up the system admin when:
- ✅ You can create a user with the admin email
- ✅ You can update the user role to `SYSTEM_ADMIN` in the database
- ✅ You can login and get a JWT token
- ✅ You can access `/api/admin/system-info` successfully
- ✅ You can assign and remove CR roles
- ✅ You can view and manage users

---

**Happy Administering! 🚀**
