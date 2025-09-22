package com.cuet.sphere.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
public class S3Service {

    private static final Logger logger = LoggerFactory.getLogger(S3Service.class);

    @Autowired(required = false)
    private S3Client s3Client;

    @Value("${aws.s3.bucket.name}")
    private String bucketName;

    @Value("${aws.s3.bucket.url}")
    private String bucketUrl;
    
    @Value("${local.storage.path}")
    private String localStoragePath;
    
    @Value("${local.storage.url}")
    private String localStorageUrl;
    


    public String uploadFile(MultipartFile file) throws IOException {
        // Generate unique file name to avoid conflicts
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = "notices/" + UUID.randomUUID().toString() + fileExtension;

        // Try S3 first, fallback to local storage
        if (s3Client != null && bucketUrl != null && !bucketUrl.isEmpty()) {
            try {
                // Upload file to S3
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fileName)
                        .contentType(file.getContentType())
                        .build();

                PutObjectResponse response = s3Client.putObject(putObjectRequest, 
                        RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

                String s3Url = bucketUrl + "/" + fileName;
                return s3Url;
            } catch (Exception e) {
                // S3 upload failed, falling back to local storage
            }
        }
        
        // Fallback to local storage
        return uploadToLocalStorage(file, fileName);
    }

    public String uploadFile(MultipartFile file, String fileName) throws IOException {
        // Upload file to S3 with custom filename
        String key = "profile/" + fileName;

        // Try S3 first, fallback to local storage
        if (s3Client != null && bucketUrl != null && !bucketUrl.isEmpty()) {
            try {
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .contentType(file.getContentType())
                        .build();

                PutObjectResponse response = s3Client.putObject(putObjectRequest, 
                        RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

                String s3Url = bucketUrl + "/" + key;
                return s3Url;
            } catch (Exception e) {
                // S3 profile upload failed, falling back to local storage
            }
        }
        
        // Fallback to local storage
        return uploadToLocalStorage(file, key);
    }

    public String uploadPostFile(MultipartFile file) throws IOException {
        // Generate unique file name to avoid conflicts
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = "posts/" + UUID.randomUUID().toString() + fileExtension;

        // Try S3 first, fallback to local storage
        if (s3Client != null && bucketUrl != null && !bucketUrl.isEmpty()) {
            try {
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(fileName)
                        .contentType(file.getContentType())
                        .build();

                PutObjectResponse response = s3Client.putObject(putObjectRequest, 
                        RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

                String s3Url = bucketUrl + "/" + fileName;
                logger.debug("Post file uploaded to S3 successfully: {}", s3Url);
                return s3Url;
            } catch (Exception e) {
                logger.error("S3 post upload failed: {}", e.getMessage(), e);
                // S3 upload failed, falling back to local storage
            }
        }
        
        // Fallback to local storage
        return uploadToLocalStorage(file, fileName);
    }

    public String uploadResourceFile(MultipartFile file, String fileName) throws IOException {
        // Upload resource file to S3 with custom filename in resources folder
        String key = "resources/" + fileName;

        // Try S3 first, fallback to local storage
        if (s3Client != null && bucketUrl != null && !bucketUrl.isEmpty()) {
            try {
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .contentType(file.getContentType())
                        .build();

                PutObjectResponse response = s3Client.putObject(putObjectRequest, 
                        RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

                String s3Url = bucketUrl + "/" + key;
                return s3Url;
            } catch (Exception e) {
                // S3 resource upload failed, falling back to local storage
                logger.error("S3 resource upload failed: {}", e.getMessage(), e);
            }
        }
        
        // Fallback to local storage
        return uploadToLocalStorage(file, key);
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }
        
        // Check if it's an S3 URL
        if (bucketUrl != null && fileUrl.startsWith(bucketUrl)) {
            String key = fileUrl.substring(bucketUrl.length() + 1); // Remove the bucket URL and leading slash
            
            try {
                if (s3Client != null) {
                    s3Client.deleteObject(builder -> builder
                            .bucket(bucketName)
                            .key(key)
                            .build());
                    // File deleted from S3
                }
            } catch (Exception e) {
                // Error deleting file from S3
            }
        }
        // Check if it's a local storage URL
        else if (localStorageUrl != null && fileUrl.startsWith(localStorageUrl)) {
            String relativePath = fileUrl.substring(localStorageUrl.length() + 1);
            Path filePath = Paths.get(localStoragePath, relativePath);
            
            try {
                Files.deleteIfExists(filePath);
                // File deleted from local storage
            } catch (Exception e) {
                // Error deleting file from local storage
            }
        }
    }
    
    private String uploadToLocalStorage(MultipartFile file, String fileName) throws IOException {
        // Create directories if they don't exist
        Path uploadPath = Paths.get(localStoragePath);
        Path filePath = uploadPath.resolve(fileName);
        
        // Create parent directories
        Files.createDirectories(filePath.getParent());
        
        // Copy file to local storage
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        String localUrl = localStorageUrl + "/" + fileName;
        return localUrl;
    }
}