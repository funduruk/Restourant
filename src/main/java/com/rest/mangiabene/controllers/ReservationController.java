package com.rest.mangiabene.controllers;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableTables(@RequestParam String date, @RequestParam String timeSlot) {
        String url = supabaseUrl + "/rest/v1/Tables?select=table_id,type,count_seats,status" +
                "&table_id=not.in.(select table_id from Reservation where reservation_date=eq." + date +
                "&time_slot=eq." + timeSlot + ")";
        return restTemplate.getForEntity(url, Object.class);
    }

    @PostMapping
    public ResponseEntity<?> createReservation(@RequestBody ReservationRequest request) {
        String url = supabaseUrl + "/rest/v1/Reservation";
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", supabaseKey);
        headers.set("Authorization", "Bearer " + supabaseKey);
        HttpEntity<ReservationRequest> entity = new HttpEntity<>(request, headers);
        return restTemplate.postForEntity(url, entity, Object.class);
    }
}

@Getter
@Setter
class ReservationRequest {
    private String client_name;
    private String number_phone_client;
    private Integer table_id;
    private String reservation_date;
    private String time_slot;
}