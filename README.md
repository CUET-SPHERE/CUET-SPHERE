# CUET Sphere - Setup Guide

A comprehensive university management system built with Spring Boot backend and React frontend.

## Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- MySQL 8.0 or higher
- MySQL Workbench (recommended for database management)
- Git

## Project Structure

```
CUET_SPHERE/
├── backend/          # Spring Boot application
├── Frontend/         # React application
├── Reports/          # Documentation and diagrams
└── README.md         # This file
```

## Database Setup

### MySQL Database Configuration

The application uses an AWS RDS MySQL database. Database credentials are configured via environment variables for security.

**Required Environment Variables:**
- `DB_HOST` - Database hostname
- `DB_PORT` - Database port (default: 3306)
- `DB_NAME` - Database name
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password

### Connecting with MySQL Workbench

1. Open MySQL Workbench
2. Click the "+" icon next to "MySQL Connections"
3. Enter connection details using the environment variables:
   - **Connection Name:** CUET Sphere DB
   - **Hostname:** [Value from DB_HOST]
   - **Port:** [Value from DB_PORT]
   - **Username:** [Value from DB_USERNAME]
   - **Password:** [Value from DB_PASSWORD] (click "Store in Vault")
   - **Default Schema:** [Value from DB_NAME]
4. Click "Test Connection" to verify
5. Click "OK" to save

**Note:** Contact your system administrator for the actual database credentials.

## Backend Setup (Spring Boot)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Configuration

Create a `.env` file in the backend directory with your database credentials:

```env
# Database Configuration
DB_HOST=your-database-host
DB_PORT=3306
DB_NAME=your-database-name
DB_USERNAME=your-username
DB_PASSWORD=your-password
```

The `application.properties` file should be configured to use environment variables:
```properties
spring.datasource.url=jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useSSL=false&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

server.port=5454
```

**⚠️ Important:** Never commit the `.env` file to version control. Add it to your `.gitignore` file.

### 3. Install Dependencies and Run

**Windows:**
```cmd
.\mvnw.cmd clean install
.\mvnw.cmd spring-boot:run
```

**Linux/Mac:**
```bash
./mvnw clean install
./mvnw spring-boot:run
```

### 4. Verify Backend

The application will start on `http://localhost:5454`

**Test endpoints:**
- Health check: `GET http://localhost:5454/actuator/health`
- API documentation: `GET http://localhost:5454/swagger-ui.html`

## Frontend Setup (React)

### 1. Navigate to Frontend Directory
```bash
cd Frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file based on `.env.example`:
```env
VITE_API_BASE_URL=http://localhost:5454
```

### 4. Start Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

`If database connection fails , try this`
# Add IP to RDS Security Group
1. Go to AWS Console → RDS → Databases → [Your DB Instance].
2. Under Connectivity & Security, find the VPC security groups section.
Click the security group link.
3. You’ll be redirected to the EC2 Security Groups page.
4. Under Inbound rules, click Edit inbound rules → Add rule.
Type: MySQL/Aurora (port 3306)
Source: My IP → it will auto-detect and set your current IP.
Or choose Custom and paste the IP you found earlier.
5. Save the rule.
