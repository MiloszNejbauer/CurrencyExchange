package com.example.demo;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashMap;
import java.util.Map;

@Data
@Document
public class Student {
    @Id
    private String id;
    private String firstName;
    private String password;
    @Indexed(unique = true)
    private String email;
    private Map<String, Float> balances = new HashMap<>();

    public Student(String firstName, String password, String email) {
        this.firstName = firstName;
        this.password = password;
        this.email = email;
        this.balances.put("PLN", 0.0f);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public Map<String, Float> getBalances() {
        return balances;
    }

    public void setBalances(Map<String, Float> balances) {
        this.balances = balances;
    }
}