package com.smartcampus.api.service;

import com.smartcampus.api.dto.BookingRequest;
import com.smartcampus.api.dto.StatusUpdateRequest;
import com.smartcampus.api.enums.BookingStatus;
import com.smartcampus.api.exception.BookingConflictException;
import com.smartcampus.api.exception.ResourceNotFoundException;
import com.smartcampus.api.model.Booking;
import com.smartcampus.api.model.Resource;
import com.smartcampus.api.model.User;
import com.smartcampus.api.repository.BookingRepository;
import com.smartcampus.api.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByUser(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    public Booking createBooking(BookingRequest request, User user) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + request.getResourceId()));

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                resource, request.getStartTime(), request.getEndTime());

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Resource is already booked for the selected time range");
        }

        Booking booking = Booking.builder()
                .resource(resource)
                .user(user)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        return bookingRepository.save(booking);
    }

    public Booking updateBookingStatus(String id, StatusUpdateRequest request) {
        Booking booking = getBookingById(id);

        BookingStatus newStatus = BookingStatus.valueOf(request.getStatus());
        booking.setStatus(newStatus);

        if (request.getReason() != null) {
            booking.setRejectionReason(request.getReason());
        }

        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(String id, User user) {
        Booking booking = getBookingById(id);

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
