package com.smartcampus.api.controller;

import com.smartcampus.api.repository.BookingRepository;
import com.smartcampus.api.repository.ResourceRepository;
import com.smartcampus.api.repository.TicketRepository;
import com.smartcampus.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> summary = new HashMap<>();

        summary.put("totalResources", resourceRepository.count());
        summary.put("totalBookings", bookingRepository.count());
        summary.put("totalTickets", ticketRepository.count());
        summary.put("totalUsers", userRepository.count());

        Map<String, Long> bookingStats = new HashMap<>();
        bookingStats.put("PENDING", bookingRepository.findByStatus(com.smartcampus.api.enums.BookingStatus.PENDING).size() * 1L);
        bookingStats.put("APPROVED", bookingRepository.findByStatus(com.smartcampus.api.enums.BookingStatus.APPROVED).size() * 1L);
        bookingStats.put("REJECTED", bookingRepository.findByStatus(com.smartcampus.api.enums.BookingStatus.REJECTED).size() * 1L);
        bookingStats.put("CANCELLED", bookingRepository.findByStatus(com.smartcampus.api.enums.BookingStatus.CANCELLED).size() * 1L);
        summary.put("bookingStats", bookingStats);

        Map<String, Long> ticketStats = new HashMap<>();
        ticketStats.put("OPEN", ticketRepository.findByStatus(com.smartcampus.api.enums.TicketStatus.OPEN).size() * 1L);
        ticketStats.put("IN_PROGRESS", ticketRepository.findByStatus(com.smartcampus.api.enums.TicketStatus.IN_PROGRESS).size() * 1L);
        ticketStats.put("RESOLVED", ticketRepository.findByStatus(com.smartcampus.api.enums.TicketStatus.RESOLVED).size() * 1L);
        ticketStats.put("CLOSED", ticketRepository.findByStatus(com.smartcampus.api.enums.TicketStatus.CLOSED).size() * 1L);
        summary.put("ticketStats", ticketStats);

        return ResponseEntity.ok(summary);
    }
}
