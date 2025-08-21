# CUET Sphere Setup and Testing Guide

## Current Status

### ✅ What's Working
- Backend server is running on http://localhost:5454
- Backend compilation is successful
- Frontend code is ready with real API integration
- Authentication system is implemented
- Admin panel is implemented
- CR management is implemented

### 🔧 Issues to Resolve
- Database connection (MySQL not running/configured)
- Frontend dependencies need installation
- Real API testing pending

## Step-by-Step Setup Guide

### 1. Database Setup

#### 1.1 Install MySQL (if not installed)
1. Download MySQL from: https://dev.mysql.com/downloads/mysql/
2. Install with default settings
3. Set root password as: `sd12` (as configured in application.properties)

#### 1.2 Create Database
```sql
CREATE DATABASE sphere;
USE sphere;
```

#### 1.3 Verify Database Connection
The backend will automatically create tables when it starts with `spring.jpa.hibernate.ddl-auto=update`

### 2. Frontend Setup

#### 2.1 Install Dependencies
```bash
cd Frontend
npm install
```

#### 2.2 Start Frontend
```bash
npm run dev
```

### 3. Backend Setup

#### 3.1 Start Backend (if not running)
```bash
cd backend
.\mvnw.cmd spring-boot:run
```

## Testing Guide

### Phase 1: Backend API Testing

#### 1.1 Test Backend Health
```bash
curl http://localhost:5454/auth/test
```
Expected: `Auth endpoint is working!`

#### 1.2 Test Signup API
```bash
curl -X POST http://localhost:5454/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@student.cuet.ac.bd",
    "password": "testpassword123",
    "hall": "Bangabandhu Sheikh Mujibur Rahman Hall",
    "bio": "Test bio"
  }'
```

#### 1.3 Test Signin API
```bash
curl -X POST http://localhost:5454/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "u2204015@student.cuet.ac.bd",
    "password": "admin123"
  }'
```

### Phase 2: Frontend Testing

#### 2.1 Test Authentication Flow
1. Open http://localhost:5173
2. Navigate to /signup
3. Create a new account
4. Test login with the created account

#### 2.2 Test Admin Panel
1. Login as admin: `u2204015@student.cuet.ac.bd` / `admin123`
2. Navigate to /admin/dashboard
3. Test CR management features

#### 2.3 Test CR Panel
1. Login as CR: `cr@student.cuet.ac.bd` / `cr123`
2. Test notice creation
3. Test resource management

### Phase 3: Integration Testing

#### 3.1 Switch to Real APIs
1. Edit `Frontend/src/services/api.js`
2. Change `DEV_MODE = false`
3. Test all functionality with real backend

## Test Credentials

### Mock Data (DEV_MODE = true)
- **Student**: `rony@student.cuet.ac.bd` / `rony123`
- **CR**: `cr@student.cuet.ac.bd` / `cr123`
- **Admin**: `u2204015@student.cuet.ac.bd` / `admin123`

### Real Data (after database setup)
- **Admin**: `u2204015@student.cuet.ac.bd` / `admin123`
- Create additional users through signup

## Troubleshooting

### Database Connection Issues
1. **Error**: `Communications link failure`
   - **Solution**: Start MySQL service
   - **Command**: `net start mysql`

2. **Error**: `Access denied for user 'root'`
   - **Solution**: Check password in application.properties
   - **Default**: `sd12`

3. **Error**: `Unknown database 'sphere'`
   - **Solution**: Create database
   - **Command**: `CREATE DATABASE sphere;`

### Frontend Issues
1. **Error**: `'vite' is not recognized`
   - **Solution**: Run `npm install` in Frontend directory

2. **Error**: `Cannot find module`
   - **Solution**: Delete node_modules and run `npm install`

### Backend Issues
1. **Error**: `Port 5454 already in use`
   - **Solution**: Kill existing process or change port in application.properties

2. **Error**: `Maven not found`
   - **Solution**: Use Maven wrapper: `.\mvnw.cmd`

## API Endpoints Reference

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `GET /auth/test` - Health check

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/assign-cr` - Assign CR role
- `DELETE /api/admin/remove-cr/{email}` - Remove CR role

### Notices
- `POST /api/notices` - Create notice
- `GET /api/notices` - Get notices
- `PUT /api/notices/{id}` - Update notice
- `DELETE /api/notices/{id}` - Delete notice

### Resources
- `POST /api/resources` - Upload resource
- `GET /api/resources` - Get resources
- `PUT /api/resources/{id}` - Update resource
- `DELETE /api/resources/{id}` - Delete resource

## Success Criteria

### Functional Requirements
- [ ] User registration works
- [ ] User login works
- [ ] Admin panel functions
- [ ] CR management works
- [ ] Notice creation works
- [ ] Resource upload works
- [ ] Role-based access control works

### Non-Functional Requirements
- [ ] Response time < 3 seconds
- [ ] Error handling is graceful
- [ ] UI is responsive
- [ ] Data persistence works

## Next Steps

1. **Complete Database Setup**
   - Install MySQL
   - Create database
   - Test connection

2. **Complete Frontend Setup**
   - Install dependencies
   - Start development server

3. **Integration Testing**
   - Test with real APIs
   - Verify all functionality

4. **Production Deployment**
   - Configure production environment
   - Deploy to server

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify all services are running
3. Check console logs for errors
4. Ensure database is properly configured

The application is 80% complete and ready for testing once the setup issues are resolved.
