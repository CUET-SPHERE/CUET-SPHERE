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
import java.util.UUID;

@Service
public class S3Service {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.s3.bucket.name}")
    private String bucketName;

    @Value("${aws.s3.bucket.url}")
    private String bucketUrl;

    public String uploadFile(MultipartFile file) throws IOException {
        // Generate unique file name to avoid conflicts
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = "notices/" + UUID.randomUUID().toString() + fileExtension;

        // Upload file to S3
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        PutObjectResponse response = s3Client.putObject(putObjectRequest, 
                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // Return the public URL of the uploaded file
        return bucketUrl + "/" + fileName;
    }

    public String uploadFile(MultipartFile file, String fileName) throws IOException {
        // Upload file to S3 with custom filename
        String key = "profile/" + fileName;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        PutObjectResponse response = s3Client.putObject(putObjectRequest, 
                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // Return the public URL of the uploaded file
        return bucketUrl + "/" + key;
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl != null && fileUrl.startsWith(bucketUrl)) {
            String key = fileUrl.substring(bucketUrl.length() + 1); // Remove the bucket URL and leading slash
            
            try {
                s3Client.deleteObject(builder -> builder
                        .bucket(bucketName)
                        .key(key)
                        .build());
            } catch (Exception e) {
                // Log the error but don't throw it to avoid breaking the application
                System.err.println("Error deleting file from S3: " + e.getMessage());
            }
        }
    }
}
