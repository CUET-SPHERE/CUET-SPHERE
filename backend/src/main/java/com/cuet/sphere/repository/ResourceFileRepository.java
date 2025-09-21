package com.cuet.sphere.repository;

import com.cuet.sphere.model.ResourceFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceFileRepository extends JpaRepository<ResourceFile, Long> {
    
    // Find all files for a specific resource
    @Query("SELECT rf FROM ResourceFile rf WHERE rf.resourceId = :resourceId ORDER BY rf.uploadOrder ASC, rf.createdAt ASC")
    List<ResourceFile> findByResourceIdOrderByUploadOrder(@Param("resourceId") Long resourceId);
    
    // Find files by resource ID with eager loading (no longer needed since no resource relationship)
    @Query("SELECT rf FROM ResourceFile rf WHERE rf.resourceId = :resourceId ORDER BY rf.uploadOrder ASC, rf.createdAt ASC")
    List<ResourceFile> findByResourceIdWithResource(@Param("resourceId") Long resourceId);
    
    // Count files for a specific resource
    @Query("SELECT COUNT(rf) FROM ResourceFile rf WHERE rf.resourceId = :resourceId")
    int countByResourceId(@Param("resourceId") Long resourceId);
    
    // Find file by ID and resource ID (for security checks)
    @Query("SELECT rf FROM ResourceFile rf WHERE rf.fileId = :fileId AND rf.resourceId = :resourceId")
    ResourceFile findByFileIdAndResourceId(@Param("fileId") Long fileId, @Param("resourceId") Long resourceId);
    
    // Delete all files for a resource (used when deleting resource)
    @Query("DELETE FROM ResourceFile rf WHERE rf.resourceId = :resourceId")
    void deleteByResourceId(@Param("resourceId") Long resourceId);
    
    // Find files by file name pattern (for search functionality)
    @Query("SELECT rf FROM ResourceFile rf WHERE rf.fileName LIKE %:fileName%")
    List<ResourceFile> findByFileNameContaining(@Param("fileName") String fileName);
    
    // Get maximum upload order for a resource (for adding new files)
    @Query("SELECT COALESCE(MAX(rf.uploadOrder), 0) FROM ResourceFile rf WHERE rf.resourceId = :resourceId")
    Integer getMaxUploadOrderByResourceId(@Param("resourceId") Long resourceId);
    
    // Find files by file type
    @Query("SELECT rf FROM ResourceFile rf WHERE rf.fileType = :fileType")
    List<ResourceFile> findByFileType(@Param("fileType") String fileType);
}