package com.smartcampus.api.controller;

import com.smartcampus.api.dto.BookingRequest;
import com.smartcampus.api.dto.StatusUpdateRequest;
import com.smartcampus.api.enums.BookingStatus;
import com.smartcampus.api.model.Booking;
import com.smartcampus.api.model.User;
import com.smartcampus.api.service.BookingService;
import com.smartcampus.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {
        if (status != null) {
            return ResponseEntity.ok(bookingService.getBookingsByStatus(status));
        }
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings(
            @AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getUserByEmail(principal.getAttribute("email"));
        return ResponseEntity.ok(bookingService.getBookingsByUser(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getUserByEmail(principal.getAttribute("email"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(request, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getUserByEmail(principal.getAttribute("email"));
        return ResponseEntity.ok(bookingService.updateBooking(id, request, user));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, request));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable String id,
            @AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getUserByEmail(principal.getAttribute("email"));
        return ResponseEntity.ok(bookingService.cancelBooking(id, user));
    }
}
