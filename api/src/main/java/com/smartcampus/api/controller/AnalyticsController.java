package com.smartcampus.api.controller;

import com.smartcampus.api.model.Booking;
import com.smartcampus.api.repository.BookingRepository;
import com.smartcampus.api.repository.ResourceRepository;
import com.smartcampus.api.repository.TicketRepository;
import com.smartcampus.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

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
        ticketStats.put("OPEN", ticketRepository.findByStatusOrderByCreatedAtDesc(com.smartcampus.api.enums.TicketStatus.OPEN).size() * 1L);
        ticketStats.put("IN_PROGRESS", ticketRepository.findByStatusOrderByCreatedAtDesc(com.smartcampus.api.enums.TicketStatus.IN_PROGRESS).size() * 1L);
        ticketStats.put("RESOLVED", ticketRepository.findByStatusOrderByCreatedAtDesc(com.smartcampus.api.enums.TicketStatus.RESOLVED).size() * 1L);
        ticketStats.put("CLOSED", ticketRepository.findByStatusOrderByCreatedAtDesc(com.smartcampus.api.enums.TicketStatus.CLOSED).size() * 1L);
        summary.put("ticketStats", ticketStats);

        // Top resources by booking count
        List<Booking> allBookings = bookingRepository.findAll();
        Map<String, Long> resourceBookingCount = allBookings.stream()
                .filter(b -> b.getResource() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getResource().getName(),
                        Collectors.counting()
                ));

        List<Map<String, Object>> topResources = resourceBookingCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", e.getKey());
                    item.put("count", e.getValue());
                    return item;
                })
                .collect(Collectors.toList());
        summary.put("topResources", topResources);

        // Peak booking hours
        Map<Integer, Long> hourCount = allBookings.stream()
                .filter(b -> b.getStartTime() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getStartTime().getHour(),
                        Collectors.counting()
                ));

        List<Map<String, Object>> peakHours = hourCount.entrySet().stream()
                .sorted(Map.Entry.<Integer, Long>comparingByValue().reversed())
                .limit(6)
                .map(e -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("hour", e.getKey() + ":00");
                    item.put("count", e.getValue());
                    return item;
                })
                .collect(Collectors.toList());
        summary.put("peakHours", peakHours);

        return ResponseEntity.ok(summary);
    }
}
