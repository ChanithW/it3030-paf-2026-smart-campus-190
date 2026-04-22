package com.smartcampus.api.service;

import com.smartcampus.api.dto.BookingRequest;
import com.smartcampus.api.dto.StatusUpdateRequest;
import com.smartcampus.api.enums.BookingStatus;
import com.smartcampus.api.enums.Role;
import com.smartcampus.api.exception.BookingConflictException;
import com.smartcampus.api.exception.ResourceNotFoundException;
import com.smartcampus.api.model.Booking;
import com.smartcampus.api.model.Resource;
import com.smartcampus.api.model.User;
import com.smartcampus.api.repository.BookingRepository;
import com.smartcampus.api.repository.ResourceRepository;
import com.smartcampus.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

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

        validateResourceCapacity(resource, request.getExpectedAttendees());
        validateResourceAvailability(resource, request.getStartTime(), request.getEndTime());

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

        Booking saved = bookingRepository.save(booking);

        // Notify the user
        notificationService.createNotification(
                user,
                "Your booking request for " + resource.getName() + " has been submitted and is pending approval.",
                "BOOKING",
                saved.getId()
        );

        // Notify all admins
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .forEach(admin -> notificationService.createNotification(
                        admin,
                        "New booking request from " + user.getName() + " for " + resource.getName() + " — needs your review.",
                        "BOOKING",
                        saved.getId()
                ));

        return saved;
    }

    private void validateResourceCapacity(Resource resource, Integer expectedAttendees) {
        if (expectedAttendees == null || resource.getCapacity() == null) {
            return;
        }

        if (expectedAttendees > resource.getCapacity()) {
            throw new BookingConflictException(
                    resource.getName() + " cannot be booked for " + expectedAttendees
                            + " attendees. Maximum capacity is " + resource.getCapacity() + "."
            );
        }
    }

    private void validateResourceAvailability(Resource resource, LocalDateTime startTime, LocalDateTime endTime) {
        String availabilityWindows = resource.getAvailabilityWindows();
        if (availabilityWindows == null || availabilityWindows.isBlank()) {
            return;
        }

        AvailabilityWindow availabilityWindow = parseAvailabilityWindow(availabilityWindows);
        if (availabilityWindow == null) {
            return;
        }

        if (!startTime.toLocalDate().equals(endTime.toLocalDate())) {
            throw new BookingConflictException(buildUnavailableMessage(resource.getName(), startTime, availabilityWindow));
        }

        DayOfWeek bookingDay = startTime.getDayOfWeek();
        if (!availabilityWindow.allowsDay(bookingDay)) {
            throw new BookingConflictException(buildUnavailableMessage(resource.getName(), startTime, availabilityWindow));
        }

        LocalTime bookingStartTime = startTime.toLocalTime();
        LocalTime bookingEndTime = endTime.toLocalTime();
        if (bookingStartTime.isBefore(availabilityWindow.startTime) || bookingEndTime.isAfter(availabilityWindow.endTime)) {
            throw new BookingConflictException(buildUnavailableMessage(resource.getName(), startTime, availabilityWindow));
        }
    }

    private AvailabilityWindow parseAvailabilityWindow(String availabilityWindows) {
        String[] parts = availabilityWindows.split("\\|");
        if (parts.length != 2) {
            return null;
        }

        String daysPart = parts[0].trim();
        String[] timeParts = parts[1].trim().split("\\s+to\\s+");
        if (timeParts.length != 2) {
            return null;
        }

        try {
            LocalTime startTime = LocalTime.parse(timeParts[0].trim());
            LocalTime endTime = LocalTime.parse(timeParts[1].trim());
            if (!endTime.isAfter(startTime)) {
                return null;
            }
            return new AvailabilityWindow(daysPart, startTime, endTime);
        } catch (Exception ex) {
            return null;
        }
    }

    private String buildUnavailableMessage(String resourceName, LocalDateTime bookingStart, AvailabilityWindow availabilityWindow) {
        return resourceName + " is not available on " + formatDayName(bookingStart.toLocalDate())
                + " at " + formatTime(bookingStart.toLocalTime()) + ". Available "
                + availabilityWindow.daysLabel + " from " + formatTime(availabilityWindow.startTime)
                + " to " + formatTime(availabilityWindow.endTime) + ".";
    }

    private String formatDayName(LocalDate date) {
        String day = date.getDayOfWeek().name().toLowerCase();
        return day.substring(0, 1).toUpperCase() + day.substring(1);
    }

    private String formatTime(LocalTime time) {
        int hour = time.getHour();
        int minute = time.getMinute();
        String period = hour >= 12 ? "PM" : "AM";
        int displayHour = hour % 12 == 0 ? 12 : hour % 12;
        return String.format("%d:%02d %s", displayHour, minute, period);
    }

    private record AvailabilityWindow(String daysLabel, LocalTime startTime, LocalTime endTime) {
        private boolean allowsDay(DayOfWeek dayOfWeek) {
            String normalized = daysLabel.trim().toLowerCase();
            return switch (normalized) {
                case "all week" -> true;
                case "weekend" -> dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
                case "mon-fri" -> dayOfWeek.getValue() >= DayOfWeek.MONDAY.getValue() && dayOfWeek.getValue() <= DayOfWeek.FRIDAY.getValue();
                case "mon-sat" -> dayOfWeek.getValue() >= DayOfWeek.MONDAY.getValue() && dayOfWeek.getValue() <= DayOfWeek.SATURDAY.getValue();
                case "monday" -> dayOfWeek == DayOfWeek.MONDAY;
                case "tuesday" -> dayOfWeek == DayOfWeek.TUESDAY;
                case "wednesday" -> dayOfWeek == DayOfWeek.WEDNESDAY;
                case "thursday" -> dayOfWeek == DayOfWeek.THURSDAY;
                case "friday" -> dayOfWeek == DayOfWeek.FRIDAY;
                case "saturday" -> dayOfWeek == DayOfWeek.SATURDAY;
                case "sunday" -> dayOfWeek == DayOfWeek.SUNDAY;
                default -> false;
            };
        }
    }

    public Booking updateBooking(String id, BookingRequest request, User user) {
        Booking booking = getBookingById(id);

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only edit your own bookings");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be edited");
        }

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + request.getResourceId()));

        validateResourceCapacity(resource, request.getExpectedAttendees());
        validateResourceAvailability(resource, request.getStartTime(), request.getEndTime());

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                resource, request.getStartTime(), request.getEndTime())
                .stream()
                .filter(b -> !b.getId().equals(id))
                .toList();

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Resource is already booked for the selected time range");
        }

        booking.setResource(resource);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        return bookingRepository.save(booking);
    }

    public Booking updateBookingStatus(String id, StatusUpdateRequest request) {
        Booking booking = getBookingById(id);
        BookingStatus newStatus = BookingStatus.valueOf(request.getStatus());
        booking.setStatus(newStatus);

        if (request.getReason() != null) {
            booking.setRejectionReason(request.getReason());
        }

        Booking saved = bookingRepository.save(booking);

        String resourceName = booking.getResource().getName();
        User bookingUser = booking.getUser();

        if (newStatus == BookingStatus.APPROVED) {
            notificationService.createNotification(
                    bookingUser,
                    "Your booking for " + resourceName + " has been APPROVED!",
                    "BOOKING",
                    saved.getId()
            );
        } else if (newStatus == BookingStatus.REJECTED) {
            String reason = request.getReason() != null ? " Reason: " + request.getReason() : "";
            notificationService.createNotification(
                    bookingUser,
                    "Your booking for " + resourceName + " has been REJECTED." + reason,
                    "BOOKING",
                    saved.getId()
            );
        }

        return saved;
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