package com.cuet.sphere.repository;

import com.cuet.sphere.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u WHERE u.email = :email")
    User findUserByEmail(@Param("email") String email);
    
    @Query("SELECT DISTINCT u FROM User u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    public List<User> searchUser(@Param("query") String query);
    
    public Optional<User> findByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.department = :department AND u.batch = :batch")
    public List<User> findByDepartmentAndBatch(@Param("department") String department, @Param("batch") String batch);
    
    @Query("SELECT u FROM User u WHERE u.batch = :batch AND u.department = :department ORDER BY u.fullName ASC")
    List<User> findByBatchAndDepartmentOrderByFullNameAsc(@Param("batch") String batch, @Param("department") String department);
    
    @Query("SELECT u FROM User u ORDER BY u.fullName ASC")
    List<User> findAllByOrderByFullNameAsc();
} 