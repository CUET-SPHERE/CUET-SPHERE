# 🚀 CUET Sphere - Deployment Guide

A comprehensive student portal for CUET with notice management, academic resources, and real-time communication.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Configuration](#database-configuration)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Production Configuration](#production-configuration)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Required Services
- **Database**: Amazon RDS (MySQL) or any MySQL-compatible database
- **File Storage**: AWS S3 bucket for file uploads
- **Email Service**: Brevo (formerly Sendinblue) for notifications
- **Hosting Platform**: Render.com, Railway, or similar container platform

### Required Tools
- Git
- Docker (for containerized deployment)
- Node.js 18+ (for frontend)
- Java 17+ (for local backend development)

## ⚙️ Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/CUET-SPHERE/CUET-SPHERE.git
cd CUET-SPHERE
```

### 2. Environment Variables
Create the following environment variables for your deployment platform:

#### Database Configuration
```env
DATABASE_URL=jdbc:mysql://your-rds-endpoint:3306/database_name
DATABASE_USERNAME=your_db_username
DATABASE_PASSWORD=your_db_password
```

#### AWS S3 Configuration
```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_REGION=your_s3_region
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_S3_BUCKET_URL=https://your-bucket.s3.region.amazonaws.com
```

#### Email Service (Brevo)
```env
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_sender_email
BREVO_SENDER_NAME=CUET Sphere
```

#### Application Settings
```env
SPRING_PROFILES_ACTIVE=prod
SYSTEM_ADMIN_EMAIL=admin@cuet.ac.bd
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
PORT=5454
```

## 🗄️ Database Configuration

### Amazon RDS Setup
1. **Create RDS Instance**:
   - Engine: MySQL 8.0+
   - Instance class: `db.t3.micro` (free tier) or higher
   - Storage: 20GB minimum
   - Enable automated backups

2. **Security Group Configuration**:
   ```
   Type: MySQL/Aurora
   Port: 3306
   Source: 0.0.0.0/0 (or specific IP ranges)
   ```

3. **Database Initialization**:
   ```sql
   CREATE DATABASE cuetsphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Run Setup Scripts**:
   - Execute scripts from `backend/sql/database_setup.sql`
   - Create admin user with `backend/sql/create_admin_user.sql`

## 🐳 Backend Deployment

### Option 1: Render.com Deployment

#### Step 1: Create Web Service
1. Go to [Render.com Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository

#### Step 2: Configure Service
```yaml
Name: cuet-sphere-backend
Environment: Docker
Branch: main
Root Directory: ./backend
Dockerfile Path: ./backend/Dockerfile
```

#### Step 3: Environment Variables
Add all the environment variables listed above in the Render dashboard under "Environment" tab.

#### Step 4: Deploy
- Click "Create Web Service"
- Wait for build and deployment to complete
- Your backend will be available at: `https://your-service-name.onrender.com`

### Option 2: Railway Deployment

#### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

#### Step 2: Login and Initialize
```bash
railway login
cd backend
railway init
```

#### Step 3: Deploy
```bash
railway up
```

#### Step 4: Configure Environment
```bash
railway variables set DATABASE_URL="your_database_url"
railway variables set AWS_ACCESS_KEY_ID="your_aws_key"
# Add all other environment variables
```

### Option 3: Docker Deployment

#### Step 1: Build Image
```bash
cd backend
docker build -t cuet-sphere-backend .
```

#### Step 2: Run Container
```bash
docker run -d \
  --name cuet-sphere-backend \
  -p 5454:5454 \
  -e DATABASE_URL="your_database_url" \
  -e AWS_ACCESS_KEY_ID="your_aws_key" \
  -e AWS_SECRET_ACCESS_KEY="your_aws_secret" \
  -e BREVO_API_KEY="your_brevo_key" \
  cuet-sphere-backend
```

## 🌐 Frontend Deployment

### Option 1: Vercel Deployment

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Deploy
```bash
cd Frontend
vercel --prod
```

#### Step 3: Environment Variables
Add in Vercel dashboard:
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

### Option 2: Netlify Deployment

#### Step 1: Build the Project
```bash
cd Frontend
npm install
npm run build
```

#### Step 2: Deploy to Netlify
1. Go to [Netlify](https://netlify.com)
2. Drag and drop the `dist` folder
3. Configure environment variables in site settings

### Option 3: Render.com Static Site

#### Step 1: Create Static Site
1. Go to Render dashboard
2. Click "New" → "Static Site"
3. Connect your repository

#### Step 2: Configure Build
```yaml
Root Directory: ./Frontend
Build Command: npm install && npm run build
Publish Directory: ./dist
```

## 🔐 Production Configuration

### Security Checklist
- [ ] Enable HTTPS for all domains
- [ ] Configure proper CORS origins
- [ ] Set secure database passwords
- [ ] Enable AWS S3 bucket policies
- [ ] Configure rate limiting
- [ ] Enable API request logging

### Performance Optimization
- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Set up database connection pooling
- [ ] Enable application monitoring
- [ ] Configure auto-scaling if needed

### Monitoring Setup
- [ ] Set up health checks
- [ ] Configure error logging
- [ ] Monitor database performance
- [ ] Set up uptime monitoring
- [ ] Configure backup strategies

## 🐛 Troubleshooting

### Common Backend Issues

#### Database Connection Errors
```bash
# Check if RDS is accessible
telnet your-rds-endpoint.amazonaws.com 3306

# Verify environment variables
echo $DATABASE_URL
```

#### Build Failures
```bash
# Clear Maven cache
./mvnw clean

# Rebuild with verbose output
./mvnw clean package -X
```

#### Memory Issues
```bash
# Increase JVM memory in Dockerfile
ENV JAVA_OPTS="-Xmx1024m -Xms512m"
```

### Common Frontend Issues

#### API Connection Problems
- Verify `VITE_API_URL` environment variable
- Check CORS configuration in backend
- Ensure backend is accessible from frontend domain

#### Build Failures
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for dependency conflicts
npm audit
```

### Environment-Specific Issues

#### Render.com
- Check build logs in dashboard
- Verify environment variables are set
- Ensure proper health check endpoint

#### Railway
- Use `railway logs` to check deployment logs
- Verify service is running with `railway status`

## 📝 Post-Deployment Tasks

### 1. Database Setup
- Run database migrations
- Create system admin user
- Set up initial data if needed

### 2. Testing
- Test user registration/login
- Verify file upload functionality
- Check email notifications
- Test WebSocket connections

### 3. Monitoring
- Set up application monitoring
- Configure error tracking
- Monitor performance metrics

## 🔗 Useful Resources

- [Render.com Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Spring Boot Docker Guide](https://spring.io/guides/topicals/spring-boot-docker/)
- [Vite Deployment Guide](https://vitejs.dev/guide/build.html)

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review platform-specific documentation
3. Check application logs for error details
4. Verify all environment variables are correctly set

## 🎯 Quick Start Checklist

- [ ] Database (RDS) created and accessible
- [ ] AWS S3 bucket configured
- [ ] Brevo email service set up
- [ ] Backend deployed with all environment variables
- [ ] Frontend deployed and connected to backend
- [ ] Domain configured with HTTPS
- [ ] Initial admin user created
- [ ] Basic functionality tested

Your CUET Sphere application should now be live and ready for use! 🚀