# Database Setup Guide for Resource Management System

This guide will help you set up the database for the CUET Sphere Resource Management System.

## 🎯 Overview

The resource management system requires the following database tables:
- **departments** - Store department information
- **courses** - Store course information with department relationships
- **semesters** - Store semester information
- **resources** - Store resource information (auto-created by JPA)

## 🚀 Setup Options

You have **3 options** to set up the database:

### Option 1: Automatic Setup (Recommended) ⭐

The easiest way - just start your application!

1. **Ensure your `application.properties` is configured correctly:**
   ```properties
   # Database configuration
   spring.datasource.url=jdbc:mysql://cuetsphere.chq8ewywywzw.ap-southeast-2.rds.amazonaws.com
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   
   # JPA/Hibernate configuration
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
   spring.jpa.properties.hibernate.format_sql=true
   ```

2. **Start your Spring Boot application:**
   ```bash
   mvn spring-boot:run
   ```

3. **The DataLoader will automatically:**
   - Create all required tables (if they don't exist)
   - Populate departments, semesters, and courses with sample data
   - Show progress messages in the console

**Console output you should see:**
```
📚 Loaded 12 departments
📅 Loaded 8 semesters
📖 Loaded 85 courses
✅ Database initialized with sample data!
```

### Option 2: Manual SQL Script

If you prefer to run SQL manually:

1. **Create your database:**
   ```sql
   CREATE DATABASE cuet_sphere;
   USE cuet_sphere;
   ```

2. **Run the SQL script:**
   ```bash
   mysql -u your_username -p cuet_sphere < database_setup.sql
   ```

3. **Or copy-paste the SQL from `database_setup.sql`** into your database client

### Option 3: Database Client (GUI)

Using tools like MySQL Workbench, phpMyAdmin, etc.:

1. **Create the database**
2. **Run the SQL commands from `database_setup.sql`**
3. **Verify the data was inserted correctly**

## 📊 Sample Data Included

### Departments (12)
- Computer Science and Engineering
- Electrical and Electronic Engineering
- Civil Engineering
- Mechanical Engineering
- Chemical Engineering
- Architecture
- Urban and Regional Planning
- Water Resources Engineering
- Industrial and Production Engineering
- Materials and Metallurgical Engineering
- Biomedical Engineering
- Nuclear Engineering

### Semesters (8)
- 1st Semester through 8th Semester

### Courses (85+)
**CSE Courses (28):**
- CSE-101: Introduction to Programming
- CSE-201: Data Structures
- CSE-301: Algorithm Design and Analysis
- CSE-401: Artificial Intelligence
- And many more...

**EEE Courses (16):**
- EEE-101: Basic Electronics
- EEE-201: Electrical Circuits II
- EEE-301: Electronics II
- And many more...

**Other Departments:**
- Civil Engineering (16 courses)
- Mechanical Engineering (10 courses)
- Chemical Engineering (10 courses)
- Architecture (10 courses)

## 🔍 Verification

After setup, verify everything is working:

### 1. Check Database Tables
```sql
SHOW TABLES;
```
Should show: `departments`, `courses`, `semesters`, `resources`, `users`, `notices`

### 2. Check Data Counts
```sql
SELECT 'Departments' as table_name, COUNT(*) as count FROM departments
UNION ALL
SELECT 'Semesters' as table_name, COUNT(*) as count FROM semesters
UNION ALL
SELECT 'Courses' as table_name, COUNT(*) as count FROM courses;
```

Expected results:
- Departments: 12
- Semesters: 8
- Courses: 85+

### 3. Test API Endpoints

Start your application and test:

```bash
# Test if application starts without errors
curl http://localhost:5454/actuator/health

# Test resource endpoints (requires authentication)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5454/api/resources
```

### 4. Use the Test Interface

1. **Start your application**
2. **Open:** `http://localhost:5454/resource-test.html`
3. **Enter a JWT token**
4. **Try creating a resource** with course code like "CSE-101"

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```
Error: Could not create connection to database server
```
**Solution:**
- Check if MySQL is running
- Verify database credentials in `application.properties`
- Ensure database exists: `CREATE DATABASE cuet_sphere;`

#### 2. Tables Not Created
```
Error: Table 'departments' doesn't exist
```
**Solution:**
- Set `spring.jpa.hibernate.ddl-auto=create-drop` for first run
- Or run the SQL script manually

#### 3. Foreign Key Constraint Failed
```
Error: Cannot add or update a child row: a foreign key constraint fails
```
**Solution:**
- Ensure departments are created before courses
- Check that all referenced IDs exist

#### 4. DataLoader Not Running
```
No "Database initialized" message in console
```
**Solution:**
- Check if `DataLoader` class is in the correct package
- Ensure `@Component` annotation is present
- Check for compilation errors

#### 5. Course Not Found Error
```
Error: Course not found with code: CSE-101
```
**Solution:**
- Verify courses were loaded: `SELECT * FROM courses WHERE course_code = 'CSE-101';`
- Check if DataLoader ran successfully
- Restart application with `spring.jpa.hibernate.ddl-auto=create-drop`

### Debug Commands

#### Check Database Content
```sql
-- Check departments
SELECT * FROM departments ORDER BY dept_name;

-- Check courses by department
SELECT 
    d.dept_name,
    c.course_code,
    c.course_name
FROM courses c
JOIN departments d ON c.dept_id = d.dept_id
ORDER BY d.dept_name, c.course_code;

-- Check semesters
SELECT * FROM semesters ORDER BY semester_name;
```

#### Check Application Logs
Look for these messages in your application console:
```
📚 Loaded 12 departments
📅 Loaded 8 semesters
📖 Loaded 85 courses
✅ Database initialized with sample data!
```

## 🔄 Reset Database

If you need to start fresh:

### Option 1: Drop and Recreate
```sql
DROP DATABASE cuet_sphere;
CREATE DATABASE cuet_sphere;
```

### Option 2: Use JPA
Set in `application.properties`:
```properties
spring.jpa.hibernate.ddl-auto=create-drop
```

### Option 3: Clear Tables
```sql
DELETE FROM resources;
DELETE FROM courses;
DELETE FROM semesters;
DELETE FROM departments;
```

## 📝 Next Steps

After successful database setup:

1. **Test the Resource Management System:**
   - Use the test interface at `http://localhost:5454/resource-test.html`
   - Create resources with different course codes
   - Test filtering and search functionality

2. **Add More Data (Optional):**
   - Add more courses to the `DataLoader` class
   - Add more departments if needed
   - Customize semester names

3. **Production Considerations:**
   - Change `spring.jpa.hibernate.ddl-auto=update` for production
   - Set up proper database backups
   - Configure connection pooling

## 🎉 Success Indicators

You'll know the setup is successful when:

✅ **Application starts without errors**  
✅ **Console shows "Database initialized with sample data!"**  
✅ **Test interface loads at `http://localhost:5454/resource-test.html`**  
✅ **You can create resources with course codes like "CSE-101"**  
✅ **Resource filtering works by course, semester, and type**  

## 📞 Support

If you encounter issues:

1. **Check the console logs** for error messages
2. **Verify database connectivity** with a database client
3. **Ensure all dependencies** are properly configured
4. **Check the troubleshooting section** above

The automatic setup (Option 1) should work for most cases. If you continue to have issues, try the manual SQL script approach.
