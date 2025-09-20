package com.cuet.sphere.repository;

import com.cuet.sphere.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    @Query("SELECT c FROM Course c WHERE c.department.deptName = :department ORDER BY c.courseCode")
    List<Course> findByDepartment(@Param("department") String department);
    
    @Query("SELECT c FROM Course c WHERE c.department.deptId = :departmentId ORDER BY c.courseCode")
    List<Course> findByDepartmentId(@Param("departmentId") Long departmentId);
    
    @Query("SELECT c FROM Course c WHERE c.courseCode = :courseCode")
    Course findByCourseCode(@Param("courseCode") String courseCode);
    
    @Query("SELECT c FROM Course c WHERE c.department.deptName = :department AND c.courseCode = :courseCode")
    Course findByDepartmentAndCourseCode(@Param("department") String department, @Param("courseCode") String courseCode);
}
