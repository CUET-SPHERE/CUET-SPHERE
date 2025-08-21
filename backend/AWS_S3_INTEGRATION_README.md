# AWS S3 Integration for File Uploads

This document describes the implementation of AWS S3 bucket integration for attachment storage in the CUET Sphere notice system.

## Overview

The system now supports file uploads to AWS S3 bucket for notice attachments. When users select attachment files, they are uploaded to S3 and the bucket URLs are stored in the PostgreSQL database.

## Features

- **Secure File Upload**: Files are uploaded directly to AWS S3
- **File Type Validation**: Only allowed file types (PDF, DOC, DOCX, JPG, PNG, GIF) are accepted
- **File Size Limits**: Maximum file size of 10MB per upload
- **Unique File Names**: UUID-based file naming to prevent conflicts
- **Automatic Cleanup**: Files are automatically deleted from S3 when notices are deleted
- **Public URLs**: Uploaded files are accessible via public URLs

## Configuration

### AWS S3 Setup

1. **Create an S3 Bucket**:
   - Go to AWS S3 Console
   - Create a new bucket with a unique name
   - Configure bucket for public read access (if needed)
   - Enable CORS for web access

2. **Create IAM User**:
   - Go to AWS IAM Console
   - Create a new user with programmatic access
   - Attach the `AmazonS3FullAccess` policy (or create a custom policy)
   - Note down the Access Key ID and Secret Access Key

3. **Configure CORS** (if needed for web access):
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### Application Configuration

Update `src/main/resources/application.properties` with your AWS credentials:

```properties
# AWS S3 Configuration
aws.access.key.id=your-access-key-id
aws.secret.access.key=your-secret-access-key
aws.s3.region=us-east-1
aws.s3.bucket.name=your-bucket-name
aws.s3.bucket.url=https://your-bucket-name.s3.us-east-1.amazonaws.com

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

## API Endpoints

### File Upload

#### Upload File
```
POST /api/upload/file
Content-Type: multipart/form-data

Parameters:
- file: The file to upload (required)

Response:
{
  "fileUrl": "https://your-bucket.s3.region.amazonaws.com/notices/uuid-filename.pdf",
  "message": "File uploaded successfully",
  "error": null
}
```

### Notice Management (Updated)

#### Create Notice with Attachment
```
POST /api/notices
Content-Type: application/json

{
  "message": "Notice message content",
  "attachment": "https://your-bucket.s3.region.amazonaws.com/notices/uuid-filename.pdf",
  "noticeType": "GENERAL"
}
```

#### Delete Notice (with automatic file cleanup)
```
DELETE /api/notices/{noticeId}
```

## Implementation Details

### File Upload Flow

1. **Client Upload**: Frontend sends file to `/api/upload/file`
2. **Validation**: Server validates file type and size
3. **S3 Upload**: File is uploaded to S3 with unique name
4. **URL Return**: S3 public URL is returned to client
5. **Notice Creation**: Client uses the URL in notice creation

### File Storage Structure

Files are stored in S3 with the following structure:
```
your-bucket/
└── notices/
    ├── uuid1-document.pdf
    ├── uuid2-image.jpg
    └── uuid3-presentation.pptx
```

### Security Features

- **File Type Validation**: Only allowed MIME types are accepted
- **File Size Limits**: 10MB maximum file size
- **Unique Naming**: UUID-based file names prevent conflicts
- **Access Control**: Only authenticated users can upload files
- **Automatic Cleanup**: Files are deleted when notices are deleted

## Dependencies Added

The following dependencies were added to `pom.xml`:

```xml
<!-- AWS S3 for file storage -->
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.24.12</version>
</dependency>
```

## New Classes Created

### 1. S3Config.java
- Configures AWS S3 client with credentials
- Creates S3Client bean for dependency injection

### 2. S3Service.java
- Handles file uploads to S3
- Manages file deletion from S3
- Generates unique file names

### 3. FileUploadController.java
- REST endpoint for file uploads
- Validates file types and sizes
- Returns upload responses

### 4. FileUploadResponse.java
- Response model for file upload operations
- Includes success/error handling

## Updated Classes

### 1. NoticeController.java
- Added validation annotations
- Added delete notice endpoint
- Improved error handling

### 2. NoticeService.java
- Added S3Service integration
- Added deleteNotice method with file cleanup
- Automatic S3 file deletion when notices are deleted

### 3. NoticeRequest.java
- Added validation annotations
- Updated attachment field documentation

### 4. application.properties
- Added AWS S3 configuration properties
- Added file upload size limits

## Usage Examples

### Frontend JavaScript (File Upload)

```javascript
// Upload file to S3
const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload/file', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    
    const result = await response.json();
    if (result.error) {
        throw new Error(result.error);
    }
    
    return result.fileUrl;
};

// Create notice with attachment
const createNoticeWithAttachment = async (message, fileUrl, noticeType) => {
    const response = await fetch('/api/notices', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            message: message,
            attachment: fileUrl,
            noticeType: noticeType
        })
    });
    
    return response.json();
};
```

### Frontend JavaScript (Complete Flow)

```javascript
// Complete file upload and notice creation flow
const handleFileUploadAndNoticeCreation = async (file, message, noticeType) => {
    try {
        // Step 1: Upload file to S3
        const fileUrl = await uploadFile(file);
        
        // Step 2: Create notice with attachment URL
        const notice = await createNoticeWithAttachment(message, fileUrl, noticeType);
        
        console.log('Notice created successfully:', notice);
        return notice;
        
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
};
```

## Error Handling

The system handles various error scenarios:

1. **File Validation Errors**:
   - Empty files
   - File size too large
   - Unsupported file types

2. **S3 Upload Errors**:
   - Network connectivity issues
   - AWS credentials problems
   - Bucket access issues

3. **Database Errors**:
   - Notice creation failures
   - File URL storage issues

## Testing

### Test File Upload
```bash
curl -X POST \
  http://localhost:5454/api/upload/file \
  -H 'Authorization: Bearer your-jwt-token' \
  -F 'file=@/path/to/test-file.pdf'
```

### Test Notice Creation with Attachment
```bash
curl -X POST \
  http://localhost:5454/api/notices \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your-jwt-token' \
  -d '{
    "message": "Test notice with attachment",
    "attachment": "https://your-bucket.s3.region.amazonaws.com/notices/uuid-file.pdf",
    "noticeType": "GENERAL"
  }'
```

## Security Considerations

1. **AWS Credentials**: Store credentials securely, never commit them to version control
2. **File Access**: Configure S3 bucket permissions appropriately
3. **CORS**: Set up CORS policies for web access
4. **File Validation**: Always validate file types and sizes on the server
5. **Access Control**: Ensure only authenticated users can upload files

## Troubleshooting

### Common Issues

1. **AWS Credentials Error**:
   - Verify access key and secret key are correct
   - Check IAM user permissions
   - Ensure region matches bucket location

2. **File Upload Fails**:
   - Check file size limits
   - Verify file type is allowed
   - Check network connectivity

3. **S3 Bucket Access**:
   - Verify bucket name is correct
   - Check bucket permissions
   - Ensure CORS is configured (if needed)

### Logs

Check application logs for:
- S3 upload/download events
- File validation errors
- AWS credential issues
- File deletion events

## Future Enhancements

1. **Image Resizing**: Automatic image resizing for thumbnails
2. **File Compression**: Automatic file compression for large files
3. **CDN Integration**: CloudFront integration for faster file delivery
4. **File Versioning**: S3 versioning for file history
5. **Batch Upload**: Support for multiple file uploads
6. **Progress Tracking**: Upload progress indicators
7. **File Preview**: In-browser file preview capabilities
