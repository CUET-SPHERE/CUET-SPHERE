# Frontend Testing Guide - CUET Sphere

## 🎯 **Testing Overview**

The backend APIs are now fully functional and the frontend is configured to use real APIs. This guide will help you test all the integrated features.

## 🚀 **Quick Start**

### 1. Access the Application
- **Frontend URL**: http://localhost:5173
- **Backend URL**: http://localhost:5454

### 2. Test Credentials
- **Admin**: `u2204015@student.cuet.ac.bd` / `asdf`
- **Test User**: `u2204001@student.cuet.ac.bd` / `testpassword123`

## 🧪 **Test Scenarios**

### **Test 1: Authentication Flow**

#### 1.1 Admin Login
1. Go to http://localhost:5173
2. Click "Sign In" or navigate to login page
3. Enter admin credentials:
   - Email: `u2204015@student.cuet.ac.bd`
   - Password: `asdf`
4. Click "Sign In"
5. **Expected Result**: Redirected to admin dashboard

#### 1.2 User Signup
1. Go to signup page
2. Fill in the form:
   - Full Name: "Test User 2"
   - Email: `u2204002@student.cuet.ac.bd`
   - Password: "testpassword123"
   - Hall: "Bangabandhu Sheikh Mujibur Rahman Hall"
   - Bio: "Test bio"
3. Click "Sign Up"
4. **Expected Result**: User created and logged in

#### 1.3 User Login
1. Logout from admin account
2. Login with newly created user
3. **Expected Result**: Redirected to student dashboard

### **Test 2: Admin Panel**

#### 2.1 Dashboard Statistics
1. Login as admin
2. Check dashboard statistics:
   - Total Users
   - Total CRs
   - Total Departments
   - Total Halls
3. **Expected Result**: Real-time data from database

#### 2.2 User Management
1. Navigate to "CR Manager" section
2. Test user filtering:
   - Search by name/email
   - Filter by department
   - Filter by batch
3. **Expected Result**: Users displayed with correct data

#### 2.3 CR Role Assignment
1. Find a student user in the list
2. Click "Assign CR" button
3. **Expected Result**: User role changes to CR
4. Test "Remove CR" functionality
5. **Expected Result**: User role reverts to STUDENT

### **Test 3: Navigation & Routing**

#### 3.1 Protected Routes
1. Try accessing `/admin/dashboard` without login
2. **Expected Result**: Redirected to login page
3. Login as regular user and try admin routes
4. **Expected Result**: Redirected to appropriate dashboard

#### 3.2 Role-Based Navigation
1. Login as admin - should see admin navbar
2. Login as student - should see regular navbar
3. **Expected Result**: Correct navigation based on role

### **Test 4: Error Handling**

#### 4.1 Invalid Credentials
1. Try login with wrong password
2. **Expected Result**: Error message displayed

#### 4.2 Network Errors
1. Stop backend server
2. Try to login
3. **Expected Result**: Network error message
4. Restart backend and try again
5. **Expected Result**: Login works

## 🔍 **Manual Testing Checklist**

### Authentication
- [ ] Admin login works
- [ ] User signup works
- [ ] User login works
- [ ] Logout works
- [ ] JWT token stored correctly
- [ ] Session persists on page refresh

### Admin Panel
- [ ] Dashboard loads with real data
- [ ] User list displays correctly
- [ ] CR assignment works
- [ ] CR removal works
- [ ] User filtering works
- [ ] Search functionality works

### Navigation
- [ ] Protected routes redirect properly
- [ ] Role-based navigation works
- [ ] Admin navbar displays for admin
- [ ] Regular navbar displays for students

### Error Handling
- [ ] Invalid credentials show error
- [ ] Network errors handled gracefully
- [ ] Loading states work correctly
- [ ] Form validation works

## 🐛 **Common Issues & Solutions**

### Issue: "Network Error" on API calls
**Solution**: Check if backend is running on port 5454

### Issue: "Invalid credentials" for admin
**Solution**: Use password "asdf" (not "admin123")

### Issue: Frontend not loading
**Solution**: Check if frontend is running on port 5173

### Issue: CORS errors
**Solution**: Backend should handle CORS automatically

## 📊 **Expected Results**

### Successful Integration
- ✅ Real-time data from database
- ✅ JWT authentication working
- ✅ Role-based access control
- ✅ Admin panel fully functional
- ✅ User management working
- ✅ Error handling working

### Performance
- ✅ Fast page loads
- ✅ Responsive UI
- ✅ Smooth navigation
- ✅ Real-time updates

## 🎉 **Success Criteria**

The integration is successful when:
1. All authentication flows work with real backend
2. Admin panel displays real user data
3. CR management functions work correctly
4. Error handling is robust
5. Navigation and routing work properly
6. No console errors in browser

## 📝 **Reporting Issues**

If you encounter any issues:
1. Check browser console for errors
2. Check backend logs for errors
3. Note the exact steps to reproduce
4. Include error messages and screenshots
5. Test with different browsers if needed
