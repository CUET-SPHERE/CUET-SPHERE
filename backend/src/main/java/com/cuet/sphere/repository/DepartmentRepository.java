package com.cuet.sphere.repository;

import com.cuet.sphere.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    @Query("SELECT d FROM Department d WHERE d.deptName = :deptName")
    Optional<Department> findByDeptName(@Param("deptName") String deptName);
}
