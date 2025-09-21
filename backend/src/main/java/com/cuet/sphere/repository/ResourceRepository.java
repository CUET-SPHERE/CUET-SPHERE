package com.cuet.sphere.repository;

import com.cuet.sphere.model.Resource;
import com.cuet.sphere.model.Resource.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    
    // Find resources by batch and department
    @Query("SELECT r FROM Resource r LEFT JOIN FETCH r.uploader LEFT JOIN FETCH r.course LEFT JOIN FETCH r.semester WHERE r.batch = :batch AND r.course.department.deptName = :department ORDER BY r.createdAt DESC")
    List<Resource> findByBatchAndDepartment(@Param("batch") String batch, @Param("department") String department);
    
    // Find resources by batch, department, and course
    @Query("SELECT r FROM Resource r LEFT JOIN FETCH r.uploader LEFT JOIN FETCH r.course LEFT JOIN FETCH r.semester WHERE r.batch = :batch AND r.course.department.deptName = :department AND r.course.courseCode = :courseCode ORDER BY r.createdAt DESC")
    List<Resource> findByBatchAndDepartmentAndCourse(@Param("batch") String batch, @Param("department") String department, @Param("courseCode") String courseCode);
    
    // Find resources by batch, department, course, and semester
    @Query("SELECT r FROM Resource r LEFT JOIN FETCH r.uploader LEFT JOIN FETCH r.course LEFT JOIN FETCH r.semester WHERE r.batch = :batch AND r.course.department.deptName = :department AND r.course.courseCode = :courseCode AND r.semester.semesterName = :semester ORDER BY r.createdAt DESC")
    List<Resource> findByBatchAndDepartmentAndCourseAndSemester(@Param("batch") String batch, @Param("department") String department, @Param("courseCode") String courseCode, @Param("semester") String semester);
    
    // Find resources by resource type
    @Query("SELECT r FROM Resource r LEFT JOIN FETCH r.uploader LEFT JOIN FETCH r.course LEFT JOIN FETCH r.semester WHERE r.batch = :batch AND r.course.department.deptName = :department AND r.resourceType = :resourceType ORDER BY r.createdAt DESC")
    List<Resource> findByBatchAndDepartmentAndResourceType(@Param("batch") String batch, @Param("department") String department, @Param("resourceType") ResourceType resourceType);
    
    // Find resources by uploader (CR)
    @Query("SELECT r FROM Resource r LEFT JOIN FETCH r.uploader LEFT JOIN FETCH r.course LEFT JOIN FETCH r.semester WHERE r.uploader.id = :uploaderId ORDER BY r.createdAt DESC")
    List<Resource> findByUploaderId(@Param("uploaderId") Long uploaderId);
    
    // Find resources by course
    @Query("SELECT r FROM Resource r LEFT JOIN FETCH r.uploader LEFT JOIN FETCH r.course LEFT JOIN FETCH r.semester WHERE r.course.courseId = :courseId ORDER BY r.createdAt DESC")
    List<Resource> findByCourseId(@Param("courseId") Long courseId);
    
    // Find resources by semester
    @Query("SELECT r FROM Resource r LEFT JOIN FETCH r.uploader LEFT JOIN FETCH r.course LEFT JOIN FETCH r.semester WHERE r.semester.semesterId = :semesterId ORDER BY r.createdAt DESC")
    List<Resource> findBySemesterId(@Param("semesterId") Long semesterId);
    
    // Search resources by title (case-insensitive)
    @Query("SELECT r FROM Resource r LEFT JOIN FETCH r.uploader LEFT JOIN FETCH r.course LEFT JOIN FETCH r.semester WHERE r.batch = :batch AND r.course.department.deptName = :department AND LOWER(r.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY r.createdAt DESC")
    List<Resource> searchByTitle(@Param("batch") String batch, @Param("department") String department, @Param("searchTerm") String searchTerm);
}
