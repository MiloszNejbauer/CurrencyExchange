package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/currencies")
public class CurrencyController {

    private static final String NBP_API_BASE_URL = "https://api.nbp.pl/api/exchangerates";

    private final RestTemplate restTemplate;

    @Autowired
    public CurrencyController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // Pobierz wszystkie aktualne kursy walut
    @GetMapping
    public ResponseEntity<?> getAllExchangeRates() {
        try {
            String url = NBP_API_BASE_URL + "/tables/A?format=json";

            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);

            List<?> table = response.getBody();
            if (table == null || table.isEmpty()) {
                return ResponseEntity.status(500).body("No data available");
            }

            List<?> rates = (List<?>) ((Map<?, ?>) table.get(0)).get("rates");
            return ResponseEntity.ok(rates);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to fetch exchange rates: " + e.getMessage());
        }
    }

    // Pobierz historyczne kursy walut
    @GetMapping("/history")
    public ResponseEntity<?> getHistoricalRates(
            @RequestParam String currency,  // Kod waluty (np. USD, EUR)
            @RequestParam String startDate, // Data początkowa (YYYY-MM-DD)
            @RequestParam String endDate    // Data końcowa (YYYY-MM-DD)
    ) {
        try {
            String url = String.format(
                    "%s/rates/A/%s/%s/%s/?format=json",
                    NBP_API_BASE_URL, currency, startDate, endDate
            );

            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (response.getBody() == null || response.getBody().get("rates") == null) {
                return ResponseEntity.status(404).body("No data found for the given parameters");
            }

            return ResponseEntity.ok(response.getBody().get("rates"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching historical rates: " + e.getMessage());
        }
    }
}

