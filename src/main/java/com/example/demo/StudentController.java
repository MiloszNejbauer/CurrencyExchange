package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/students")
public class StudentController {

    private final StudentService studentService;
    private final TransactionRepository transactionRepository; // Dodano transactionRepository

    @Autowired
    public StudentController(StudentService studentService, TransactionRepository transactionRepository) {
        this.studentService = studentService;
        this.transactionRepository = transactionRepository; // Wstrzyknięcie transactionRepository
    }

    // Get all students
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        List<Student> students = studentService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    // Get student by ID
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable String id) {
        return studentService.getStudentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create new student
    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        Student createdStudent = studentService.createStudent(student);
        return ResponseEntity.ok(createdStudent);
    }

    @DeleteMapping
    public void deleteStudentByID(String id) {
        studentService.deleteStudentById(id);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestParam String firstName, @RequestParam String password) {
        Optional<Student> studentOptional = studentService.findByFirstNameAndPassword(firstName, password);
        if (studentOptional.isPresent()) {
            String studentId = studentOptional.get().getId(); // Pobieranie poprawnego ID użytkownika
            return ResponseEntity.ok(studentId); // Zwracanie ID w odpowiedzi
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerStudent(@RequestBody Student student) {
        boolean isFirstNameTaken = studentService.existsByFirstName(student.getFirstName());
        boolean isEmailTaken = studentService.existsByEmail(student.getEmail());

        if (isFirstNameTaken || isEmailTaken) {
            String errorMessage = "Registration failed. ";
            if (isFirstNameTaken) {
                errorMessage += "First name is already in use. ";
            }
            if (isEmailTaken) {
                errorMessage += "Email is already in use.";
            }
            return ResponseEntity.badRequest().body(errorMessage.trim());
        }

        Student createdStudent = studentService.createStudent(student);
        return ResponseEntity.ok(createdStudent);
    }

    @PatchMapping("/{id}/balance")
    public ResponseEntity<?> updateBalance(
            @PathVariable String id,
            @RequestParam String currency,
            @RequestParam float amount
    ) {
        try {
            float updatedBalance = studentService.updateBalance(id, currency, amount);
            return ResponseEntity.ok(updatedBalance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/balance")
    public ResponseEntity<Float> getBalance(
            @PathVariable String id,
            @RequestParam String currency
    ) {
        try {
            float balance = studentService.getBalance(id, currency);
            return ResponseEntity.ok(balance);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PostMapping("/{id}/exchange")
    public ResponseEntity<?> exchangeCurrency(
            @PathVariable String id,
            @RequestParam String fromCurrency,
            @RequestParam String toCurrency,
            @RequestParam float fromAmount,
            @RequestParam float toAmount
    ) {
        try {
            studentService.exchangeCurrency(id, fromCurrency, toCurrency, fromAmount, toAmount);
            return ResponseEntity.ok("Exchange successful");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<Transaction>> getTransactionHistory(@PathVariable String id) {
        List<Transaction> transactions = transactionRepository.findByUserId(id);
        if (transactions.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.ok(transactions);
    }

}
