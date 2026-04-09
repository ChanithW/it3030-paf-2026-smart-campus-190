package com.smartcampus.api.repository;

import com.smartcampus.api.enums.BookingStatus;
import com.smartcampus.api.model.Booking;
import com.smartcampus.api.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByResourceId(String resourceId);

    @Query("SELECT b FROM Booking b WHERE b.resource = :resource " +
           "AND b.status = 'APPROVED' " +
           "AND b.startTime < :endTime " +
           "AND b.endTime > :startTime")
    List<Booking> findConflictingBookings(
        @Param("resource") Resource resource,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
}
