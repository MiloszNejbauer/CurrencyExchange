package com.example.demo;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

//@AllArgsConstructor
@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final TransactionRepository transactionRepository;

    @Autowired
    public StudentService(StudentRepository studentRepository, TransactionRepository transactionRepository) {
        this.studentRepository = studentRepository;
        this.transactionRepository = transactionRepository;
    }


    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Optional<Student> getStudentById(String id) {
        return studentRepository.findById(id);
    }

    public List<Transaction> getTransactionHistory(String studentId) {
        return transactionRepository.findByUserId(studentId);
    }


    public Student createStudent(Student student) {
        // Inicjalizuj saldo w PLN podczas tworzenia użytkownika
        student.getBalances().put("PLN", 0.0f);
        return studentRepository.save(student);
    }

    public void deleteStudentById(String id) {
        studentRepository.deleteStudentById(id);
        System.out.println("Student deleted");
    }

    public boolean login(String firstName, String password) {
        Optional<Student> studentOptional = studentRepository.findByFirstName(firstName);
        if (studentOptional.isPresent()) {
            Student student = studentOptional.get();
            return student.getPassword().equals(password);
        }
        return false;
    }

    public Optional<Student> findByFirstNameAndPassword(String firstName, String password) {
        Optional<Student> studentOptional = studentRepository.findByFirstName(firstName);
        return studentOptional.filter(student -> student.getPassword().equals(password));
    }

    public boolean existsByFirstName(String firstName) {
        return studentRepository.existsByFirstName(firstName);
    }

    public boolean existsByEmail(String email) {
        return studentRepository.existsByEmail(email);
    }

    // Aktualizacja salda w konkretnej walucie
    public float updateBalance(String studentId, String currency, float amount) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Map<String, Float> balances = student.getBalances();
        float currentBalance = balances.getOrDefault(currency, 0.0f);

        float newBalance = currentBalance + amount;
        if (newBalance < 0) {
            throw new RuntimeException("Insufficient balance in " + currency);
        }

        balances.put(currency, newBalance);
        student.setBalances(balances);
        studentRepository.save(student);

        return newBalance;
    }

    // Pobieranie salda dla konkretnej waluty
    public float getBalance(String studentId, String currency) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return student.getBalances().getOrDefault(currency, 0.0f);
    }

    // Wymiana walut
    public void exchangeCurrency(String studentId, String fromCurrency, String toCurrency, float fromAmount, float toAmount) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Map<String, Float> balances = student.getBalances();

        // Sprawdź dostępne saldo w walucie źródłowej
        float currentFromBalance = balances.getOrDefault(fromCurrency, 0.0f);
        if (currentFromBalance < fromAmount) {
            throw new RuntimeException("Insufficient balance in " + fromCurrency);
        }

        // Zmniejsz saldo waluty źródłowej
        balances.put(fromCurrency, currentFromBalance - fromAmount);

        // Zwiększ saldo waluty docelowej
        float currentToBalance = balances.getOrDefault(toCurrency, 0.0f);
        balances.put(toCurrency, currentToBalance + toAmount);

        student.setBalances(balances);
        studentRepository.save(student);

        // Zapisz transakcję
        Transaction transaction = new Transaction();
        transaction.setUserId(studentId);
        transaction.setFromCurrency(fromCurrency);
        transaction.setToCurrency(toCurrency);
        transaction.setFromAmount(fromAmount);
        transaction.setToAmount(toAmount);
        transaction.setTimestamp(LocalDateTime.now());

        transactionRepository.save(transaction);
    }

}
