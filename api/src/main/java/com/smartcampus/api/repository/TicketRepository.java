package com.smartcampus.api.repository;

import com.smartcampus.api.enums.TicketStatus;
import com.smartcampus.api.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, String> {
    List<Ticket> findByUserId(String userId);
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByAssignedToId(String userId);
    List<Ticket> findByPriority(String priority);
}