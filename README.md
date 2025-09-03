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

The application uses an AWS RDS MySQL database with the following configuration:

- **Host:** `cuetsphere.chq8ewywywzw.ap-southeast-2.rds.amazonaws.com`
- **Port:** `3306`
- **Database:** `main_cuetsphere`
- **Username:** `admin`
- **Password:** `asdfg1122`

### Connecting with MySQL Workbench

1. Open MySQL Workbench
2. Click the "+" icon next to "MySQL Connections"
3. Enter connection details:
   - **Connection Name:** CUET Sphere DB
   - **Hostname:** `cuetsphere.chq8ewywywzw.ap-southeast-2.rds.amazonaws.com`
   - **Port:** `3306`
   - **Username:** `admin`
   - **Password:** `asdfg1122` (click "Store in Vault")
   - **Default Schema:** `main_cuetsphere`
4. Click "Test Connection" to verify
5. Click "OK" to save

## Backend Setup (Spring Boot)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Configuration

The `application.properties` file is already configured with:
```properties
spring.datasource.url=jdbc:mysql://cuetsphere.chq8ewywywzw.ap-southeast-2.rds.amazonaws.com:3306/main_cuetsphere?useSSL=false&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
spring.datasource.username=admin
spring.datasource.password=asdfg1122
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

server.port=5454
```

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
