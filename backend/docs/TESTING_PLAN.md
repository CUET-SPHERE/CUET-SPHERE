# CUET Sphere Backend-Frontend Integration Testing Plan

## Overview
This document outlines the testing strategy for the CUET Sphere application's backend-frontend integration, focusing on authentication, admin functionality, and CR panel features.

## Test Environment Setup

### Frontend Development Server
- URL: http://localhost:5173 (Vite default)
- Status: Running with mock data (DEV_MODE = true)
- Proxy: Configured to forward API calls to backend

### Backend Server (When Available)
- URL: http://localhost:5454
- Database: MySQL (sphere database)
- Status: Currently using mock data for testing

## Test Cases

### 1. Authentication Flow

#### 1.1 User Registration (Signup)
**Test Steps:**
1. Navigate to http://localhost:5173/signup
2. Fill in registration form:
   - Full Name: "Test User"
   - Email: "test@student.cuet.ac.bd"
   - Password: "testpassword123"
   - Confirm Password: "testpassword123"
   - Hall: "Bangabandhu Sheikh Mujibur Rahman Hall"
   - Bio: "Test bio"
3. Click "Create Account"
4. Verify successful registration and redirect to dashboard

**Expected Results:**
- Form validation works correctly
- User is created with STUDENT role
- JWT token is generated and stored
- Redirect to /dashboard
- User data is stored in localStorage

**Edge Cases:**
- Invalid email format (not @student.cuet.ac.bd)
- Password mismatch
- Empty required fields
- Duplicate email registration

#### 1.2 User Login (Signin)
**Test Steps:**
1. Navigate to http://localhost:5173/login
2. Test with existing credentials:
   - Student: rony@student.cuet.ac.bd / rony123
   - CR: cr@student.cuet.ac.bd / cr123
   - Admin: u2204015@student.cuet.ac.bd / admin123
3. Click "Sign in"
4. Verify successful login and role-based redirect

**Expected Results:**
- Students redirect to /dashboard
- CRs redirect to /dashboard
- Admins redirect to /admin/dashboard
- JWT token is stored
- User context is updated

**Edge Cases:**
- Invalid email/password combination
- Non-existent user
- Empty fields
- Network errors

#### 1.3 Authentication Persistence
**Test Steps:**
1. Login successfully
2. Refresh the page
3. Navigate to different routes
4. Close and reopen browser
5. Check localStorage

**Expected Results:**
- User remains logged in after refresh
- Token persists in localStorage
- Protected routes remain accessible
- Role-based access control works

### 2. Admin Panel Testing

#### 2.1 Admin Dashboard Access
**Test Steps:**
1. Login as admin (u2204015@student.cuet.ac.bd)
2. Navigate to /admin/dashboard
3. Verify dashboard loads with statistics

**Expected Results:**
- Dashboard displays user statistics
- CR management section is visible
- Department and hall management sections load
- Real-time data from API

#### 2.2 CR Management
**Test Steps:**
1. Access CR Manager from admin dashboard
2. View list of all users
3. Filter users by department and batch
4. Search for specific users
5. Assign CR role to a student
6. Remove CR role from a user

**Expected Results:**
- User list loads correctly
- Filters work properly
- Search functionality works
- CR assignment/removal updates user role
- Success/error messages display correctly

**Edge Cases:**
- No users found
- Network errors during operations
- Invalid user selection
- Permission errors

#### 2.3 User Management
**Test Steps:**
1. View all users in the system
2. Filter by department
3. Filter by batch
4. Search by name/email/student ID
5. View user details

**Expected Results:**
- User list displays correctly
- Filters work as expected
- Search returns relevant results
- User details are accurate

### 3. CR Panel Testing

#### 3.1 CR Dashboard Access
**Test Steps:**
1. Login as CR user (cr@student.cuet.ac.bd)
2. Navigate to dashboard
3. Verify CR-specific features

**Expected Results:**
- Dashboard loads with CR-specific content
- Notice creation capabilities
- Resource management access
- Student view of notices/resources

#### 3.2 Notice Management (CR)
**Test Steps:**
1. Create a new notice
2. Upload attachment
3. Set notice type and target audience
4. Publish notice
5. Edit existing notice
6. Delete notice

**Expected Results:**
- Notice creation form works
- File uploads successfully
- Notice is published to target audience
- Edit/delete operations work
- Notifications are sent

#### 3.3 Resource Management (CR)
**Test Steps:**
1. Upload academic resource
2. Set resource metadata (course, semester, type)
3. Organize resources by category
4. Share resources with department/batch
5. Manage existing resources

**Expected Results:**
- File upload works
- Resource metadata is saved
- Organization features work
- Sharing permissions work correctly

### 4. Student Dashboard Testing

#### 4.1 Student Dashboard Access
**Test Steps:**
1. Login as student (rony@student.cuet.ac.bd)
2. Navigate to dashboard
3. Verify student-specific features

**Expected Results:**
- Dashboard loads with student information
- Weekly schedule displays
- Class routine is visible
- Recent activity shows
- Quick access to resources

#### 4.2 Notice Viewing
**Test Steps:**
1. View notices from CRs and admins
2. Filter notices by type
3. Download attachments
4. Mark notices as read

**Expected Results:**
- Notices display correctly
- Filters work properly
- Attachments download successfully
- Read status updates

#### 4.3 Resource Access
**Test Steps:**
1. Browse available resources
2. Search for specific resources
3. Download resources
4. Filter by course/semester

**Expected Results:**
- Resource list loads
- Search functionality works
- Downloads complete successfully
- Filters apply correctly

### 5. Role-Based Access Control

#### 5.1 Route Protection
**Test Steps:**
1. Try accessing admin routes as student
2. Try accessing CR routes as student
3. Try accessing protected routes without login
4. Test role-based redirects

**Expected Results:**
- Unauthorized access is blocked
- Proper redirects occur
- Error messages are displayed
- Role-based navigation works

#### 5.2 Feature Access
**Test Steps:**
1. Verify students can't access admin features
2. Verify students can't create notices
3. Verify CRs can't access admin panel
4. Verify admins can access all features

**Expected Results:**
- Feature access is properly restricted
- UI elements are hidden/shown based on role
- Error messages for unauthorized actions

### 6. Error Handling

#### 6.1 Network Errors
**Test Steps:**
1. Disconnect network during API calls
2. Test with slow network
3. Test with invalid API responses

**Expected Results:**
- Graceful error handling
- User-friendly error messages
- Retry mechanisms work
- App doesn't crash

#### 6.2 Validation Errors
**Test Steps:**
1. Submit forms with invalid data
2. Test email validation
3. Test password requirements
4. Test required field validation

**Expected Results:**
- Form validation works
- Error messages are clear
- Invalid data is rejected
- User can correct errors

### 7. Performance Testing

#### 7.1 Load Testing
**Test Steps:**
1. Load dashboard with many users
2. Test with large file uploads
3. Test with many notices/resources

**Expected Results:**
- Pages load within acceptable time
- File uploads complete successfully
- UI remains responsive
- Memory usage is reasonable

#### 7.2 Responsive Design
**Test Steps:**
1. Test on different screen sizes
2. Test on mobile devices
3. Test on tablets

**Expected Results:**
- Layout adapts to screen size
- Touch interactions work
- Navigation is accessible
- Content is readable

## Test Data

### Mock Users
- **Student**: rony@student.cuet.ac.bd / rony123
- **CR**: cr@student.cuet.ac.bd / cr123
- **Admin**: u2204015@student.cuet.ac.bd / admin123

### Test Files
- Sample PDF: Available in assets
- Sample images: Available in assets
- Sample documents: Available in assets

## Bug Reporting

### Bug Report Template
```
**Bug Title**: [Brief description]

**Severity**: [Critical/High/Medium/Low]

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: [What should happen]

**Actual Result**: [What actually happens]

**Environment**:
- Browser: [Chrome/Firefox/Safari/Edge]
- OS: [Windows/Mac/Linux]
- Device: [Desktop/Mobile/Tablet]

**Screenshots**: [If applicable]

**Additional Notes**: [Any other relevant information]
```

## Success Criteria

### Functional Requirements
- [ ] All authentication flows work correctly
- [ ] Role-based access control is enforced
- [ ] Admin panel functions properly
- [ ] CR panel functions properly
- [ ] Student dashboard works correctly
- [ ] File uploads work
- [ ] Notices and resources are managed properly

### Non-Functional Requirements
- [ ] Response times are acceptable (< 3 seconds)
- [ ] Error handling is graceful
- [ ] UI is responsive and accessible
- [ ] Data persistence works correctly
- [ ] Security measures are in place

## Next Steps

1. **Backend Integration**: Once backend server is running, switch DEV_MODE to false
2. **Database Testing**: Test with real MySQL database
3. **Production Testing**: Deploy to staging environment
4. **User Acceptance Testing**: Conduct with actual users
5. **Security Testing**: Perform security audit
6. **Performance Optimization**: Based on testing results

## Notes

- Currently using mock data for testing (DEV_MODE = true)
- Backend server needs to be running for full integration testing
- Database setup required for complete testing
- AWS S3 integration needs to be configured for file uploads


