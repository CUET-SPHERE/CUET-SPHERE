package com.cuet.sphere.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class S3Config {

    @Value("${aws.access.key.id:}")
    private String accessKeyId;

    @Value("${aws.secret.access.key:}")
    private String secretAccessKey;

    @Value("${aws.s3.region:us-east-1}")
    private String region;

    @Value("${local.storage.path:./src/main/resources/static/uploads}")
    private String localStoragePath;

    @Bean
    public S3Client s3Client() {
        // Only create S3Client if AWS credentials are provided
        if (accessKeyId != null && !accessKeyId.isEmpty() && 
            secretAccessKey != null && !secretAccessKey.isEmpty()) {
            AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
            
            return S3Client.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                    .build();
        }
        return null; // Return null if no AWS credentials
    }

    @Bean
    public Path localStorageDirectory() {
        return Paths.get(localStoragePath);
    }
}