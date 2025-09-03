package com.cuet.sphere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.cuet.sphere"})
@EntityScan(basePackages = {"com.cuet.sphere.model"})
public class CuetSphereApplication {

	public static void main(String[] args) {
		System.out.println("=== STARTING CUET SPHERE APPLICATION ===");
		System.out.println("Component scanning packages: com.cuet.sphere");
		System.out.println("Entity scanning packages: com.cuet.sphere.model");
		
		SpringApplication.run(CuetSphereApplication.class, args);
		
		System.out.println("=== CUET SPHERE APPLICATION STARTED SUCCESSFULLY ===");
	}
}