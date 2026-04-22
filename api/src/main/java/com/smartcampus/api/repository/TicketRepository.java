package com.smartcampus.api.repository;

import com.smartcampus.api.enums.TicketStatus;
import com.smartcampus.api.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, String> {
    List<Ticket> findAllByOrderByCreatedAtDesc();
    List<Ticket> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);
    List<Ticket> findByAssignedToIdOrderByCreatedAtDesc(String userId);
    List<Ticket> findByPriorityOrderByCreatedAtDesc(String priority);
}