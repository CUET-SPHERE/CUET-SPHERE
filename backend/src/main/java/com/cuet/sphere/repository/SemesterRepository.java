package com.cuet.sphere.repository;

import com.cuet.sphere.model.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {
    
    @Query("SELECT s FROM Semester s WHERE s.semesterName = :semesterName")
    Semester findBySemesterName(@Param("semesterName") String semesterName);
}
