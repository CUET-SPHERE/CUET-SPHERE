package com.cuet.sphere.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

public class DotenvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private static final Logger logger = LoggerFactory.getLogger(DotenvConfig.class);

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory("./")
                    .ignoreIfMalformed()
                    .ignoreIfMissing()
                    .load();

            ConfigurableEnvironment environment = applicationContext.getEnvironment();
            Map<String, Object> envMap = new HashMap<>();
            
            dotenv.entries().forEach(entry -> {
                envMap.put(entry.getKey(), entry.getValue());
                System.setProperty(entry.getKey(), entry.getValue());
            });
            
            environment.getPropertySources().addFirst(new MapPropertySource("dotenv", envMap));
            logger.debug("Environment variables loaded from .env file: {}", envMap.keySet());
            
        } catch (Exception e) {
            logger.debug("No .env file found or error loading it: {}", e.getMessage());
        }
    }
}