# Cuet Sphere - JWT Authentication API

This is a Spring Boot application with JWT-based authentication for the Cuet Sphere project.

## Features

- User registration (signup)
- User authentication (signin)
- JWT token generation and validation
- Role-based access control (STUDENT, CR)
- Secure password hashing with BCrypt

## API Endpoints

### Authentication Endpoints

#### 1. User Registration (Signup)
- **URL**: `POST /auth/signup`
- **Description**: Register a new user
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "hall": "Hall A",
  "bio": "Student bio",
  "role": "STUDENT"
}
```
- **Response**:
```json
{
  "token": "jwt.token.here",
  "success": true,
  "message": "User created successfully",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "STUDENT"
}
```

#### 2. User Authentication (Signin)
- **URL**: `POST /auth/signin`
- **Description**: Authenticate existing user and get JWT token
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "token": "jwt.token.here",
  "success": true,
  "message": "Signin successful",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "STUDENT"
}
```

#### 3. Test Endpoint
- **URL**: `GET /auth/test`
- **Description**: Test if the auth endpoint is working
- **Response**: `"Auth endpoint is working!"`

## JWT Token Usage

After successful signin, include the JWT token in the Authorization header for protected endpoints:

```
Authorization: Bearer <jwt_token>
```

## Security Configuration

- JWT tokens expire after 24 hours
- Passwords are hashed using BCrypt
- Stateless session management
- CORS enabled for frontend integration
- Protected endpoints require valid JWT token

## Running the Application

1. Ensure you have Java 17+ and Maven installed
2. Run the application:
   ```bash
   mvn spring-boot:run
   ```
3. The application will start on port 8080

## Testing

Run the tests with:
```bash
mvn test
```

## Database

The application uses an in-memory H2 database by default. Configure your database connection in `application.properties` for production use. 