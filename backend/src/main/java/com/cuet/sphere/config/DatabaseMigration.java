package com.cuet.sphere.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Database migration component to ensure AUTO_INCREMENT is properly set
 * on all primary key columns that use GenerationType.IDENTITY
 */
@Component
@Profile("!h2") // Don't run for H2 profile
public class DatabaseMigration implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🔧 Running database migrations...");
        addAutoIncrementToTables();
        System.out.println("✅ Database migrations completed successfully!");
    }

    private void addAutoIncrementToTables() {
        // List of tables and their primary key columns that need AUTO_INCREMENT
        List<TableInfo> tables = Arrays.asList(
            new TableInfo("courses", "course_id"),
            new TableInfo("users", "id"),
            new TableInfo("departments", "dept_id"),
            new TableInfo("semesters", "semester_id"),
            new TableInfo("notices", "notice_id"),
            new TableInfo("password_reset_otps", "id"),
            new TableInfo("resources", "id"),
            new TableInfo("posts", "id"),
            new TableInfo("comments", "id"),
            new TableInfo("replies", "id"),
            new TableInfo("votes", "id"),
            new TableInfo("notifications", "id")
        );

        for (TableInfo table : tables) {
            try {
                // Check if the table exists
                String checkTableSql = "SELECT COUNT(*) FROM information_schema.tables " +
                                      "WHERE table_schema = DATABASE() AND table_name = ?";
                Integer count = jdbcTemplate.queryForObject(checkTableSql, Integer.class, table.tableName);
                
                if (count != null && count > 0) {
                    // Check if the column already has AUTO_INCREMENT
                    String checkAutoIncrementSql = "SELECT EXTRA FROM information_schema.columns " +
                                                  "WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?";
                    String extra = jdbcTemplate.queryForObject(checkAutoIncrementSql, String.class, 
                                                             table.tableName, table.primaryKeyColumn);
                    
                    if (extra == null || !extra.contains("auto_increment")) {
                        // Handle foreign key constraints for certain tables
                        if (table.tableName.equals("courses")) {
                            handleCoursesTableMigration();
                        } else if (table.tableName.equals("departments")) {
                            handleDepartmentsTableMigration();
                        } else if (table.tableName.equals("semesters")) {
                            handleSemestersTableMigration();
                        } else {
                            // For tables without foreign key constraints
                            String alterSql = String.format("ALTER TABLE %s MODIFY COLUMN %s BIGINT NOT NULL AUTO_INCREMENT", 
                                                           table.tableName, table.primaryKeyColumn);
                            jdbcTemplate.execute(alterSql);
                            System.out.println("✅ Added AUTO_INCREMENT to " + table.tableName + "." + table.primaryKeyColumn);
                        }
                    } else {
                        System.out.println("ℹ️  AUTO_INCREMENT already exists on " + table.tableName + "." + table.primaryKeyColumn);
                    }
                } else {
                    System.out.println("⚠️  Table " + table.tableName + " does not exist, skipping...");
                }
            } catch (Exception e) {
                System.err.println("❌ Error updating " + table.tableName + ": " + e.getMessage());
                // Continue with other tables even if one fails
            }
        }
    }

    private void handleCoursesTableMigration() {
        try {
            // Temporarily disable foreign key checks
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
            
            // Modify the courses table to add AUTO_INCREMENT
            jdbcTemplate.execute("ALTER TABLE courses MODIFY COLUMN course_id BIGINT NOT NULL AUTO_INCREMENT");
            
            // Re-enable foreign key checks
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            
            System.out.println("✅ Added AUTO_INCREMENT to courses.course_id");
        } catch (Exception e) {
            // Re-enable foreign key checks even if there's an error
            try {
                jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            } catch (Exception ignored) {}
            System.err.println("❌ Error updating courses table: " + e.getMessage());
        }
    }

    private void handleDepartmentsTableMigration() {
        try {
            // Temporarily disable foreign key checks
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
            
            // Modify the departments table to add AUTO_INCREMENT
            jdbcTemplate.execute("ALTER TABLE departments MODIFY COLUMN dept_id BIGINT NOT NULL AUTO_INCREMENT");
            
            // Re-enable foreign key checks
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            
            System.out.println("✅ Added AUTO_INCREMENT to departments.dept_id");
        } catch (Exception e) {
            // Re-enable foreign key checks even if there's an error
            try {
                jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            } catch (Exception ignored) {}
            System.err.println("❌ Error updating departments table: " + e.getMessage());
        }
    }

    private void handleSemestersTableMigration() {
        try {
            // Temporarily disable foreign key checks
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
            
            // Modify the semesters table to add AUTO_INCREMENT
            jdbcTemplate.execute("ALTER TABLE semesters MODIFY COLUMN semester_id BIGINT NOT NULL AUTO_INCREMENT");
            
            // Re-enable foreign key checks
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            
            System.out.println("✅ Added AUTO_INCREMENT to semesters.semester_id");
        } catch (Exception e) {
            // Re-enable foreign key checks even if there's an error
            try {
                jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            } catch (Exception ignored) {}
            System.err.println("❌ Error updating semesters table: " + e.getMessage());
        }
    }

    private static class TableInfo {
        final String tableName;
        final String primaryKeyColumn;

        TableInfo(String tableName, String primaryKeyColumn) {
            this.tableName = tableName;
            this.primaryKeyColumn = primaryKeyColumn;
        }
    }
}