# Resource Management System

This document describes the implementation of the resource management system for the CUET Sphere project, based on the provided ER diagram.

## Overview

The resource management system allows CR (Class Representative) users to upload, edit, and delete educational resources. Students can access these resources based on their course, batch, department, and semester. Resources are stored as Google Drive links for easy access and sharing.

## Features

- **CR Resource Management**: Only CR users can upload, edit, and delete resources
- **Department-based Access**: Users can only access resources from their department
- **Course & Semester Filtering**: Resources can be filtered by course and semester
- **Resource Type Classification**: Multiple resource types (Lecture Notes, Assignments, etc.)
- **Search Functionality**: Search resources by title
- **Google Drive Integration**: Resources are stored as Google Drive links
- **Batch & Department Scoping**: Automatic filtering based on user's batch and department

## Database Schema

### Resources Table
- `resource_id`: Primary key
- `r_batch`: Batch code (e.g., "22")
- `r_resource_type`: Resource type enum
- `r_title`: Resource title
- `r_file_path`: Google Drive link
- `r_description`: Optional description
- `r_created_at`: Creation timestamp
- `r_updated_at`: Last update timestamp
- `uploader_id`: Foreign key to users table
- `course_id`: Foreign key to courses table
- `semester_id`: Foreign key to semesters table

### Courses Table
- `course_id`: Primary key
- `course_code`: Course code (e.g., "CSE-101")
- `course_name`: Course name
- `dept_id`: Foreign key to departments table

### Semesters Table
- `semester_id`: Primary key
- `semester_name`: Semester name (e.g., "1st Semester")

### Departments Table
- `dept_id`: Primary key
- `dept_name`: Department name

## Resource Types

The system supports the following resource types:
- **LECTURE_NOTE**: Lecture notes and slides
- **ASSIGNMENT**: Course assignments
- **LAB_MANUAL**: Laboratory manuals
- **BOOK**: Textbooks and reference books
- **PRESENTATION**: Presentation slides
- **QUESTION_PAPER**: Previous question papers
- **SOLUTION**: Solutions to assignments/exams
- **OTHER**: Miscellaneous resources

## API Endpoints

### Resource Management (CR Only)

#### Create Resource
```
POST /api/resources
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "title": "Data Structures Lecture Notes",
  "resourceType": "LECTURE_NOTE",
  "courseCode": "CSE-201",
  "semesterName": "3rd Semester",
  "filePath": "https://drive.google.com/file/d/...",
  "description": "Complete lecture notes for Data Structures course"
}
```

#### Update Resource
```
PUT /api/resources/{resourceId}
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "title": "Updated Data Structures Lecture Notes",
  "resourceType": "LECTURE_NOTE",
  "courseCode": "CSE-201",
  "semesterName": "3rd Semester",
  "filePath": "https://drive.google.com/file/d/...",
  "description": "Updated lecture notes"
}
```

#### Delete Resource
```
DELETE /api/resources/{resourceId}
Authorization: Bearer <jwt-token>
```

### Resource Access (All Users)

#### Get All Resources (filtered by user's batch and department)
```
GET /api/resources
Authorization: Bearer <jwt-token>
```

#### Get Resources by Course
```
GET /api/resources/course/{courseCode}
Authorization: Bearer <jwt-token>
```

#### Get Resources by Course and Semester
```
GET /api/resources/course/{courseCode}/semester/{semester}
Authorization: Bearer <jwt-token>
```

#### Get Resources by Type
```
GET /api/resources/type/{resourceType}
Authorization: Bearer <jwt-token>
```

#### Get My Resources (CR Only)
```
GET /api/resources/my
Authorization: Bearer <jwt-token>
```

#### Get Specific Resource
```
GET /api/resources/{resourceId}
Authorization: Bearer <jwt-token>
```

#### Search Resources
```
GET /api/resources/search?q={searchTerm}
Authorization: Bearer <jwt-token>
```

## Implementation Details

### Access Control

1. **CR-Only Operations**: Only users with CR role can create, update, and delete resources
2. **Department Restriction**: Users can only upload resources for their own department
3. **Batch & Department Filtering**: Users can only access resources for their batch and department
4. **Ownership Control**: Users can only edit/delete their own resources (unless they have CR role)

### Resource Filtering

Resources are automatically filtered based on:
- **User's Batch**: Only resources from the user's batch are shown
- **User's Department**: Only resources from the user's department are shown
- **Course**: Optional filtering by specific course
- **Semester**: Optional filtering by specific semester
- **Resource Type**: Optional filtering by resource type
- **Search Term**: Text-based search in resource titles

### Google Drive Integration

- Resources are stored as Google Drive links in the `r_file_path` field
- Users can directly access files by clicking the links
- No file upload to server - all files are stored in Google Drive
- Easy sharing and access control through Google Drive

## Usage Examples

### Frontend JavaScript (Create Resource)

```javascript
// Create a new resource (CR only)
const createResource = async (resourceData) => {
    const response = await fetch('/api/resources', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resourceData)
    });
    return response.json();
};

// Example usage
const resourceData = {
    title: "Advanced Algorithms Notes",
    resourceType: "LECTURE_NOTE",
    courseCode: "CSE-301",
    semesterName: "5th Semester",
    filePath: "https://drive.google.com/file/d/1ABC123...",
    description: "Comprehensive notes on advanced algorithms"
};

const result = await createResource(resourceData);
```

### Frontend JavaScript (Access Resources)

```javascript
// Get all resources for current user
const getResources = async () => {
    const response = await fetch('/api/resources', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};

// Get resources by course
const getResourcesByCourse = async (courseCode) => {
    const response = await fetch(`/api/resources/course/${courseCode}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};

// Search resources
const searchResources = async (searchTerm) => {
    const response = await fetch(`/api/resources/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};
```

## Testing

### Test Interface

A comprehensive test interface is available at `http://localhost:5454/resource-test.html` that includes:

1. **Authentication**: JWT token management
2. **Resource Creation**: Form for creating new resources
3. **Resource Management**: View, search, and filter resources
4. **Resource Actions**: Delete resources
5. **Real-time Updates**: Automatic refresh after operations

### Test Scenarios

1. **CR User Operations**:
   - Create resources for their department
   - Edit their own resources
   - Delete their own resources
   - View all resources in their batch/department

2. **Student User Operations**:
   - View resources for their batch/department
   - Search resources by title
   - Filter resources by course, semester, type
   - Access resource files via Google Drive links

3. **Access Control**:
   - Verify CR-only operations are restricted
   - Verify department-based access control
   - Verify batch-based filtering

## Security Features

1. **Role-based Access**: Only CR users can create/edit/delete resources
2. **Department Isolation**: Users can only access resources from their department
3. **Batch Filtering**: Resources are automatically filtered by user's batch
4. **Ownership Control**: Users can only modify their own resources
5. **Input Validation**: All resource data is validated before processing
6. **Authentication Required**: All operations require valid JWT token

## Error Handling

The system handles various error scenarios:

1. **Authentication Errors**: Invalid or missing JWT tokens
2. **Authorization Errors**: Insufficient permissions for operations
3. **Validation Errors**: Invalid resource data
4. **Not Found Errors**: Resources, courses, or semesters not found
5. **Department Mismatch**: Attempting to access resources from different department

## Database Setup

### Required Tables

The system requires the following tables to be created:

1. **departments**: Store department information
2. **courses**: Store course information with department relationships
3. **semesters**: Store semester information
4. **resources**: Store resource information with relationships

### Sample Data

You may need to populate the database with sample data:

```sql
-- Insert departments
INSERT INTO departments (dept_name) VALUES 
('Computer Science and Engineering'),
('Electrical and Electronic Engineering'),
('Civil Engineering');

-- Insert courses
INSERT INTO courses (course_code, course_name, dept_id) VALUES 
('CSE-101', 'Introduction to Programming', 1),
('CSE-201', 'Data Structures', 1),
('EEE-101', 'Basic Electronics', 2);

-- Insert semesters
INSERT INTO semesters (semester_name) VALUES 
('1st Semester'),
('2nd Semester'),
('3rd Semester'),
('4th Semester');
```

## Future Enhancements

1. **File Upload**: Direct file upload to Google Drive via API
2. **Resource Categories**: Hierarchical resource organization
3. **Resource Ratings**: User ratings and reviews for resources
4. **Resource Analytics**: Download statistics and usage metrics
5. **Resource Versioning**: Multiple versions of the same resource
6. **Resource Sharing**: Share resources with specific users or groups
7. **Resource Approval**: Admin approval workflow for resource uploads
8. **Resource Tags**: Tag-based resource organization
9. **Resource Comments**: User comments and discussions
10. **Resource Notifications**: Notify users about new resources

## Troubleshooting

### Common Issues

1. **Authentication Failed**:
   - Verify JWT token is valid and not expired
   - Check if user exists in database
   - Ensure proper Authorization header format

2. **Resource Not Found**:
   - Verify resource ID is correct
   - Check if user has access to the resource's department
   - Ensure resource belongs to user's batch

3. **Permission Denied**:
   - Verify user has CR role for create/edit/delete operations
   - Check if user is trying to access resources from different department
   - Ensure user owns the resource for edit/delete operations

4. **Course/Semester Not Found**:
   - Verify course code exists in database
   - Check if semester name is correct
   - Ensure course belongs to user's department

### Logs

Check application logs for:
- Authentication events
- Resource creation/update/deletion events
- Access control violations
- Database operation errors
- Validation failures
