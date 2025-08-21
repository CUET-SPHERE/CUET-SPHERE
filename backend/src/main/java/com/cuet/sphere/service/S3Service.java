package com.cuet.sphere.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class S3Service {
    @Autowired
    private Path localStorageDirectory;

    @Value("${local.storage.url}")
    private String localStorageUrl;

    public String uploadFile(MultipartFile file) throws IOException {
        // Generate unique file name to avoid conflicts
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = "notices_" + UUID.randomUUID().toString() + fileExtension;
        Path targetPath = localStorageDirectory.resolve(fileName);
        Files.createDirectories(localStorageDirectory);
        file.transferTo(targetPath.toFile());
        return localStorageUrl + "/" + fileName;
    }

    public String uploadFile(MultipartFile file, String fileName) throws IOException {
        // Upload file to local storage with custom filename
        String key = "profile_" + fileName;
        Path targetPath = localStorageDirectory.resolve(key);
        Files.createDirectories(localStorageDirectory);
        file.transferTo(targetPath.toFile());
        return localStorageUrl + "/" + key;
    }
}
