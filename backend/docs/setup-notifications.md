# CUET Sphere Notification System Setup Guide

## 🎯 Overview

This guide will help you set up the complete notification system for CUET Sphere, including:

1. **Email Notifications** via Brevo
2. **Push Notifications** via WebSocket
3. **Database Storage** for notifications
4. **Frontend Integration** with real-time updates

## 🚀 Features Implemented

### Backend Features
- ✅ **Notification Model & Repository** - Database storage for notifications
- ✅ **NotificationService** - Business logic for creating and managing notifications
- ✅ **NotificationController** - REST API endpoints for notifications
- ✅ **Email Integration** - Enhanced EmailService with notification templates
- ✅ **WebSocket Integration** - Real-time push notifications
- ✅ **Auto-triggers** - Notifications sent automatically on user actions

### Frontend Features
- ✅ **NotificationService** - API client for notification operations
- ✅ **NotificationsContext** - React context for state management
- ✅ **Real-time Updates** - WebSocket integration for live notifications
- ✅ **Notification Badge** - Unread count display in navbar
- ✅ **Notifications Page** - Full notification management interface

### Notification Types
1. **Welcome Notification** - When user signs up
2. **Post Comment Notification** - When someone comments on your post
3. **Comment Reply Notification** - When someone replies to your comment
4. **Admin Post Notification** - When any user creates a new post (sent to admins)

## 🛠️ Setup Instructions

### 1. Backend Setup

#### Database Migration
The notification table will be created automatically when you start the backend due to `spring.jpa.hibernate.ddl-auto=update`.

#### Environment Variables
Make sure your `backend/.env` or `application.properties` has:

```properties
# Brevo Email Configuration
brevo.api.key=your_brevo_api_key_here
brevo.sender.email=your_verified_sender_email@domain.com
brevo.sender.name=CUET Sphere

# Database Configuration (already configured)
spring.datasource.url=jdbc:mysql://cuetsphere.chq8ewywywzw.ap-southeast-2.rds.amazonaws.com:3306/main_cuetsphere?useSSL=false&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
spring.datasource.username=admin
spring.datasource.password=asdfg1122
```

#### Start Backend
```bash
cd backend
./mvnw spring-boot:run
```

### 2. Frontend Setup

#### Environment Variables
Make sure your `Frontend/.env` has:

```env
VITE_API_URL=http://localhost:5454
VITE_BREVO_API_KEY=your_brevo_api_key_here
VITE_BREVO_SENDER_EMAIL=your_verified_sender_email@domain.com
```

#### Install Dependencies & Start
```bash
cd Frontend
npm install
npm run dev
```

### 3. Brevo Email Service Setup

1. **Sign up** at https://www.brevo.com/
2. **Get API Key**: Settings → API Keys → Create new key
3. **Verify Sender Email**: Senders & IP → Senders → Add and verify your email
4. **Add credentials** to both backend and frontend environment files

## 🧪 Testing the System

### Option 1: Use the Test Page
1. Open `test-notifications.html` in your browser
2. Follow the step-by-step tests:
   - Test Signup (triggers welcome email & notification)
   - Test Post Creation (triggers admin notification)
   - Test Comment Creation (triggers post owner notification)
   - Test Reply Creation (triggers comment owner notification)
   - Check Notifications (view all notifications)

### Option 2: Manual Testing
1. **Sign up a new user** → Should receive welcome email
2. **Create a post** → Admins should get notification
3. **Comment on a post** → Post owner should get notification
4. **Reply to a comment** → Comment owner should get notification
5. **Check notifications page** → All notifications should appear

### Option 3: API Testing
Use the provided endpoints:

```bash
# Get notifications
GET http://localhost:5454/api/notifications
Authorization: Bearer YOUR_JWT_TOKEN

# Get unread count
GET http://localhost:5454/api/notifications/unread-count
Authorization: Bearer YOUR_JWT_TOKEN

# Mark as read
PUT http://localhost:5454/api/notifications/{id}/read
Authorization: Bearer YOUR_JWT_TOKEN

# Delete notification
DELETE http://localhost:5454/api/notifications/{id}
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📧 Email Templates

The system includes beautiful HTML email templates for:

1. **Welcome Email** - Sent when user signs up
2. **Comment Notification** - Sent when someone comments on your post
3. **Reply Notification** - Sent when someone replies to your comment
4. **Admin Notification** - Sent to admins when new posts are created

## 🔔 Push Notifications

Real-time notifications are delivered via WebSocket:
- Automatic connection when user logs in
- Instant delivery of notifications
- Updates notification badge in real-time
- No page refresh needed

## 🗄️ Database Schema

New table created: `notifications`

```sql
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_post_id BIGINT,
    related_comment_id BIGINT,
    related_reply_id BIGINT,
    actor_user_id BIGINT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🎨 Frontend Components

### Updated Components
- **Navbar** - Shows notification badge with unread count
- **NotificationsPage** - Complete notification management
- **NotificationsContext** - State management with real-time updates

### New Services
- **NotificationService** - API client for notification operations
- **Enhanced WebSocketService** - Added notification subscription

## 🔧 Configuration

### WebSocket Configuration
WebSocket is configured to handle:
- Notice broadcasts (existing)
- User-specific notifications (new)
- Real-time updates

### Security
- All notification endpoints require authentication
- Users can only access their own notifications
- Admin notifications are sent only to SYSTEM_ADMIN users

## 🐛 Troubleshooting

### Email Issues
- **Not receiving emails**: Check spam folder, verify sender email in Brevo
- **API errors**: Verify API key and sender email configuration
- **Rate limiting**: Brevo has sending limits, check your dashboard

### WebSocket Issues
- **Not connecting**: Check if backend WebSocket endpoint is running
- **No real-time updates**: Verify WebSocket connection in browser dev tools
- **Connection drops**: WebSocket will auto-reconnect on page refresh

### Database Issues
- **Table not created**: Check if `spring.jpa.hibernate.ddl-auto=update` is set
- **Foreign key errors**: Ensure user exists before creating notifications

## 📊 Monitoring

### Backend Logs
Monitor console output for:
- Email sending status
- WebSocket connection status
- Notification creation logs
- Error messages

### Frontend Logs
Check browser console for:
- WebSocket connection status
- Notification reception logs
- API call results

## 🚀 Production Deployment

### Backend
1. Set production Brevo credentials
2. Configure production database
3. Enable HTTPS for WebSocket connections
4. Set up email monitoring

### Frontend
1. Update API URLs for production
2. Configure production Brevo credentials
3. Build and deploy frontend
4. Test WebSocket connections over HTTPS

## 📈 Future Enhancements

Potential improvements:
- Email preferences (allow users to disable certain notifications)
- Notification categories and filtering
- Push notifications for mobile apps
- Notification scheduling
- Bulk notification operations
- Notification analytics

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts and connects to backend
- [ ] Brevo credentials are configured
- [ ] WebSocket connection established
- [ ] Signup sends welcome email
- [ ] Post creation notifies admins
- [ ] Comments notify post owners
- [ ] Replies notify comment owners
- [ ] Notifications appear in real-time
- [ ] Notification badge updates correctly
- [ ] Email templates render properly

## 🎉 Success!

If all tests pass, your CUET Sphere notification system is fully operational! Users will now receive:
- Welcome emails when they sign up
- Real-time notifications for interactions
- Email notifications for important events
- A complete notification management interface

The system is designed to be robust, scalable, and user-friendly. Enjoy your enhanced CUET Sphere experience! 🎓✨