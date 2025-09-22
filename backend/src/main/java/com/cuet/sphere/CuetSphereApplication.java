package com.cuet.sphere;

import com.cuet.sphere.config.DotenvConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ComponentScan(basePackages = {"com.cuet.sphere"})
@EntityScan(basePackages = {"com.cuet.sphere.model"})
@EnableScheduling
public class CuetSphereApplication {

	private static final Logger logger = LoggerFactory.getLogger(CuetSphereApplication.class);

	public static void main(String[] args) {
		logger.info("Starting CUET Sphere Application");
		
		SpringApplication app = new SpringApplication(CuetSphereApplication.class);
		app.addInitializers(new DotenvConfig());
		app.run(args);
		
		logger.info("CUET Sphere Application started successfully");
	}
}