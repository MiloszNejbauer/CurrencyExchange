package com.example.demo;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface StudentRepository extends MongoRepository<Student, String> {
    Optional<Student> findStudentByEmail(String email);

    void deleteStudentById(String id);

    Optional<Student> findByFirstName(String firstName);

    // Sprawdzenie istnienia użytkownika na podstawie firstName
    boolean existsByFirstName(String firstName);

    // Sprawdzenie istnienia użytkownika na podstawie email
    boolean existsByEmail(String email);


}
