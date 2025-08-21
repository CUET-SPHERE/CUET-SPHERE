package com.cuet.sphere.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class S3Config {
    @Value("${local.storage.path}")
    private String localStoragePath;

    @Bean
    public Path localStorageDirectory() {
        return Paths.get(localStoragePath);
    }
}
