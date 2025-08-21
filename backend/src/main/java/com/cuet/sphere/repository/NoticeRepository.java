package com.cuet.sphere.repository;

import com.cuet.sphere.model.Notice;
import com.cuet.sphere.model.Notice.NoticeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    
    @Query("SELECT n FROM Notice n WHERE n.batch = :batch AND n.department = :department ORDER BY n.createdAt DESC")
    Page<Notice> findByBatchAndDepartmentOrderByCreatedAtDesc(
        @Param("batch") String batch, 
        @Param("department") String department,
        Pageable pageable
    );
    
    @Query("SELECT n FROM Notice n WHERE n.sender.id = :senderId ORDER BY n.createdAt DESC")
    List<Notice> findBySenderIdOrderByCreatedAtDesc(@Param("senderId") Long senderId);
    
    @Query("SELECT n FROM Notice n WHERE n.batch = :batch AND n.department = :department AND n.noticeType = :noticeType ORDER BY n.createdAt DESC")
    List<Notice> findByBatchAndDepartmentAndNoticeTypeOrderByCreatedAtDesc(
        @Param("batch") String batch, 
        @Param("department") String department, 
        @Param("noticeType") NoticeType noticeType
    );
    
    @Query("SELECT n FROM Notice n ORDER BY n.createdAt DESC")
    List<Notice> findAllByOrderByCreatedAtDesc();
}
