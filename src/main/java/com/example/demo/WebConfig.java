package com.example.demo;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").allowedOrigins("http://localhost:8081", "http://192.168.1.36", "http://192.168.1.18:8081/_expo/loading", "exp://192.168.1.18:8081", "https://679008807eb45b2d95360f11--bolokantor.netlify.app").allowedMethods("GET", "POST", "PATCH", "DELETE", "PUT"); // lub IP urządzenia

    }
}
