package com.cuet.sphere.util;

public class StudentEmailParser {
    
    /**
     * Parse CUET student email to extract batch, department, and student ID
     * Email format: u2204015@student.cuet.ac.bd
     * Where: 22 = batch, 04 = department, 015 = student ID
     */
    public static StudentInfo parseStudentEmail(String email) {
        if (email == null || !email.contains("@student.cuet.ac.bd")) {
            throw new IllegalArgumentException("Invalid CUET student email format");
        }
        
        String prefix = email.substring(0, email.indexOf("@"));
        if (!prefix.startsWith("u")) {
            throw new IllegalArgumentException("Invalid CUET student email format: must start with 'u'");
        }
        
        String numbers = prefix.substring(1); // Remove 'u' prefix
        
        if (numbers.length() < 7) {
            throw new IllegalArgumentException("Invalid CUET student email format: insufficient digits");
        }
        
        String batch = numbers.substring(0, 2);
        String department = numbers.substring(2, 4);
        String studentId = numbers.substring(4);
        
        return new StudentInfo(batch, department, studentId);
    }
    
    public static class StudentInfo {
        private final String batch;
        private final String department;
        private final String studentId;
        
        public StudentInfo(String batch, String department, String studentId) {
            this.batch = batch;
            this.department = department;
            this.studentId = studentId;
        }
        
        public String getBatch() {
            return batch;
        }
        
        public String getDepartment() {
            return department;
        }
        
        public String getStudentId() {
            return studentId;
        }
        
        public String getFullStudentId() {
            return batch + department + studentId;
        }
        
        @Override
        public String toString() {
            return "StudentInfo{" +
                    "batch='" + batch + '\'' +
                    ", department='" + department + '\'' +
                    ", studentId='" + studentId + '\'' +
                    '}';
        }
    }
}
