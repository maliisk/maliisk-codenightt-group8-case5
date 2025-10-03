package com.codenight.bip;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class BipCoordinatorApplication {
	public static void main(String[] args) {
		SpringApplication.run(BipCoordinatorApplication.class, args);
	}
}
