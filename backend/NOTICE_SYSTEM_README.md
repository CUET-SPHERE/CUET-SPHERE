# Notice System Implementation

This document describes the implementation of the real-time notice system for the CUET Sphere project.

## Overview

The notice system allows CR (Class Representative) users to send notices to students in their specific batch and department. Notices are delivered in real-time using WebSocket technology, ensuring immediate notification delivery.

## Features

- **Role-based Access Control**: Only CR users can create notices
- **Batch & Department Scoping**: Notices are automatically scoped to the sender's batch and department
- **Real-time Delivery**: WebSocket-based instant notification delivery
- **Multiple Notice Types**: Support for GENERAL, URGENT, ACADEMIC, EVENT, and OTHER notice types
- **Attachment Support**: Optional file attachments for notices
- **Audit Trail**: Full tracking of notice creation and updates

## Database Schema

### Users Table
- `id`: Primary key
- `u_full_name`: User's full name
- `u_email`: CUET student email (format: u2204015@student.cuet.ac.bd)
- `u_password`: Encrypted password
- `u_hall`: Student hall
- `u_bio`: User biography
- `u_batch`: Batch code (e.g., "22")
- `u_department`: Department code (e.g., "04")
- `u_student_id`: Student ID (e.g., "015")
- `u_is_active`: Account status
- `u_req_user`: Request user flag
- `u_role`: User role (STUDENT or CR)
- `u_profile_img_url`: Profile image URL
- `u_created_at`: Account creation timestamp
- `u_updated_at`: Last update timestamp

### Notices Table
- `notice_id`: Primary key
- `N_department`: Department code
- `N_batch`: Batch code
- `N_message`: Notice content (TEXT)
- `N_attachment`: Optional attachment URL
- `N_notice_type`: Notice type enum
- `N_created_at`: Creation timestamp
- `N_updated_at`: Last update timestamp
- `sender_id`: Foreign key to users table

## Email Parsing

The system automatically parses CUET student emails to extract batch, department, and student ID:

- **Email Format**: u2204015@student.cuet.ac.bd
- **Batch**: 22 (first 2 digits)
- **Department**: 04 (next 2 digits)
- **Student ID**: 015 (remaining digits)

## API Endpoints

### Notice Management

#### Create Notice (CR Only)
```
POST /api/notices
Content-Type: application/json

{
  "message": "Notice message content",
  "attachment": "optional_attachment_url",
  "noticeType": "GENERAL"
}
```

#### Get Notices for Current User
```
GET /api/notices
```

#### Get Notices by Type
```
GET /api/notices/type/{noticeType}
```

#### Get Notices Sent by Current User (CR Only)
```
GET /api/notices/my
```

#### Get Specific Notice
```
GET /api/notices/{noticeId}
```

## WebSocket Endpoints

### Connection
- **WebSocket URL**: `/ws`
- **SockJS Fallback**: Enabled for browser compatibility

### Topics
- **Batch/Department Notices**: `/topic/notices/{batch}/{department}`
- **Personal Notices**: `/user/{userId}/queue/notices`
- **All Notices**: `/topic/notices`

### Message Mapping
- **Subscribe to Notices**: `/app/notices/subscribe`
- **Subscribe to Batch/Department**: `/app/notices/batch-department`

## Security Features

1. **Authentication Required**: All notice operations require valid authentication
2. **Role-based Access**: Only CR users can create notices
3. **Data Isolation**: Users can only access notices for their batch and department
4. **Input Validation**: All notice data is validated before processing

## Real-time Notification Flow

1. **CR User Creates Notice**: Notice is saved to database
2. **WebSocket Notification**: Notice is immediately sent to all connected users in the same batch/department
3. **Client Reception**: Connected clients receive the notice in real-time
4. **UI Update**: Client applications update their UI to display the new notice

## Testing

A test HTML page is provided at `/notice-test.html` to test the WebSocket functionality:

1. Open the test page in a browser
2. Connect to the WebSocket server
3. Subscribe to notices for specific batch/department
4. Send test notices (simulated)
5. Monitor real-time notice delivery

## Usage Examples

### Frontend JavaScript (WebSocket)
```javascript
// Connect to WebSocket
const socket = new SockJS('/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function (frame) {
    // Subscribe to notices for specific batch/department
    stompClient.subscribe('/topic/notices/22/04', function (notice) {
        const noticeData = JSON.parse(notice.body);
        displayNotice(noticeData);
    });
});
```

### Frontend JavaScript (REST API)
```javascript
// Create a notice (CR users only)
const createNotice = async (noticeData) => {
    const response = await fetch('/api/notices', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(noticeData)
    });
    return response.json();
};

// Get notices for current user
const getNotices = async () => {
    const response = await fetch('/api/notices', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};
```

## Configuration

The system uses Spring Boot's default WebSocket configuration with the following customizations:

- **Allowed Origins**: All origins (`*`) for development
- **Message Broker**: Simple in-memory broker
- **User Destination Prefix**: `/user` for personal messages
- **Application Destination Prefix**: `/app` for client-to-server messages

## Dependencies

- Spring Boot WebSocket Starter
- Spring Boot Web Starter
- Spring Boot Data JPA
- Spring Boot Security
- MySQL Connector
- Lombok

## Future Enhancements

1. **Push Notifications**: Mobile push notification support
2. **Notice Templates**: Predefined notice templates for common scenarios
3. **Scheduled Notices**: Future-dated notice delivery
4. **Notice Analytics**: Read receipts and engagement metrics
5. **File Upload**: Direct file attachment support
6. **Notice Categories**: Hierarchical notice organization
7. **Multi-language Support**: Internationalization for notices

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if the application is running
   - Verify WebSocket endpoint configuration
   - Check browser console for errors

2. **Notices Not Received**
   - Verify user is subscribed to correct topic
   - Check batch and department values
   - Ensure WebSocket connection is active

3. **Permission Denied**
   - Verify user has CR role
   - Check authentication token
   - Ensure user is accessing correct batch/department data

### Logs

Check application logs for:
- WebSocket connection events
- Notice creation/deletion events
- Authentication failures
- Database operation errors
