package com.cuet.sphere.repository;

import com.cuet.sphere.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByStudentId(String studentId);
    
    // Legacy method names for compatibility - returning User directly (not Optional)
    User findUserByEmail(String email);
    List<User> findAllByOrderByFullNameAsc();
    List<User> findByBatchAndDepartmentOrderByFullNameAsc(String batch, String department);
    List<User> findByDepartmentAndBatch(String department, String batch);
    List<User> findByRole(User.Role role);
}