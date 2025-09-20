package com.cuet.sphere.repository;

import com.cuet.sphere.model.CurrentSemester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CurrentSemesterRepository extends JpaRepository<CurrentSemester, String> {
    
    @Query("SELECT cs FROM CurrentSemester cs WHERE cs.department.deptName = :department AND cs.batch = :batch AND cs.isActive = true")
    Optional<CurrentSemester> findActiveByDepartmentAndBatch(@Param("department") String department, @Param("batch") String batch);
    
    @Query("SELECT cs FROM CurrentSemester cs WHERE cs.department.deptName = :department AND cs.batch = :batch")
    List<CurrentSemester> findByDepartmentAndBatch(@Param("department") String department, @Param("batch") String batch);
    
    @Query("SELECT cs FROM CurrentSemester cs WHERE cs.semester.semesterName = :semesterName AND cs.department.deptName = :department AND cs.batch = :batch")
    Optional<CurrentSemester> findBySemesterNameAndDepartmentAndBatch(@Param("semesterName") String semesterName,
                                                                    @Param("department") String department,
                                                                    @Param("batch") String batch);
    
    boolean existsBySemester_SemesterNameAndDepartment_DeptNameAndBatch(String semesterName, String department, String batch);
}