package com.smartcampus.api.service;

import com.smartcampus.api.dto.CommentRequest;
import com.smartcampus.api.dto.StatusUpdateRequest;
import com.smartcampus.api.dto.TicketRequest;
import com.smartcampus.api.enums.Role;
import com.smartcampus.api.enums.TicketStatus;
import com.smartcampus.api.exception.ResourceNotFoundException;
import com.smartcampus.api.exception.UnauthorizedException;
import com.smartcampus.api.model.Comment;
import com.smartcampus.api.model.Ticket;
import com.smartcampus.api.model.User;
import com.smartcampus.api.repository.CommentRepository;
import com.smartcampus.api.repository.TicketRepository;
import com.smartcampus.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Ticket> getTicketsByUser(String userId) {
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Ticket> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    public Ticket createTicket(TicketRequest request, User user) {
        Ticket ticket = Ticket.builder()
                .user(user)
                .category(request.getCategory())
                .description(request.getDescription())
                .priority(request.getPriority())
                .location(request.getLocation())
                .contactDetails(request.getContactDetails())
                .status(TicketStatus.OPEN)
                .build();

        Ticket saved = ticketRepository.save(ticket);

        // Notify the user
        notificationService.createNotification(
                user,
                "Your incident ticket for '" + request.getCategory() + "' has been submitted successfully.",
                "TICKET",
                saved.getId()
        );

        // Notify all admins
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .forEach(admin -> notificationService.createNotification(
                        admin,
                        "New incident ticket submitted by " + user.getName() + " — Category: " + request.getCategory() + ". Needs your review.",
                        "TICKET",
                        saved.getId()
                ));

        return saved;
    }

    public Ticket updateTicketStatus(String id, StatusUpdateRequest request) {
        Ticket ticket = getTicketById(id);
        TicketStatus newStatus = TicketStatus.valueOf(request.getStatus());
        ticket.setStatus(newStatus);

        if (request.getReason() != null) {
            ticket.setRejectionReason(request.getReason());
        }

        if (request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }

        if (request.getAssignedToId() != null) {
            User technician = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            ticket.setAssignedTo(technician);

            notificationService.createNotification(
                    technician,
                    "You have been assigned to ticket: " + ticket.getCategory(),
                    "TICKET",
                    ticket.getId()
            );
        }

        Ticket saved = ticketRepository.save(ticket);
        User ticketOwner = ticket.getUser();

        switch (newStatus) {
            case IN_PROGRESS -> notificationService.createNotification(
                    ticketOwner,
                    "Your ticket '" + ticket.getCategory() + "' is now IN PROGRESS.",
                    "TICKET",
                    saved.getId()
            );
            case RESOLVED -> notificationService.createNotification(
                    ticketOwner,
                    "Your ticket '" + ticket.getCategory() + "' has been RESOLVED!",
                    "TICKET",
                    saved.getId()
            );
            case CLOSED -> notificationService.createNotification(
                    ticketOwner,
                    "Your ticket '" + ticket.getCategory() + "' has been CLOSED.",
                    "TICKET",
                    saved.getId()
            );
            case REJECTED -> notificationService.createNotification(
                    ticketOwner,
                    "Your ticket '" + ticket.getCategory() + "' has been REJECTED.",
                    "TICKET",
                    saved.getId()
            );
            default -> {}
        }

        return saved;
    }

    public Comment addComment(String ticketId, CommentRequest request, User user) {
        Ticket ticket = getTicketById(ticketId);

        Comment comment = Comment.builder()
                .ticket(ticket)
                .user(user)
                .content(request.getContent())
                .build();

        Comment saved = commentRepository.save(comment);

        if (!ticket.getUser().getId().equals(user.getId())) {
            notificationService.createNotification(
                    ticket.getUser(),
                    "New comment on your ticket '" + ticket.getCategory() + "': " + request.getContent(),
                    "COMMENT",
                    ticketId
            );
        }

        return saved;
    }

    public Comment updateComment(String commentId, CommentRequest request, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        return commentRepository.save(comment);
    }

    public void deleteComment(String commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    public List<Comment> getCommentsByTicket(String ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }

    public Ticket saveTicket(Ticket ticket) {
        return ticketRepository.save(ticket);
    }

    public Ticket updateTicket(String id, TicketRequest request, User user) {
        Ticket ticket = getTicketById(id);

        if (!ticket.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to edit this ticket");
        }

        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new IllegalStateException("You can only edit tickets that are still OPEN");
        }

        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription());
        ticket.setLocation(request.getLocation());

        Ticket saved = ticketRepository.save(ticket);

        // Notify Admins
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .forEach(admin -> notificationService.createNotification(
                        admin,
                        "Ticket updated by " + user.getName() + ": " + ticket.getCategory(),
                        "TICKET",
                        saved.getId()
                ));

        return saved;
    }

    @Transactional
    public void deleteTicket(String id, User user) {
        if (user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can delete tickets");
        }

        Ticket ticket = getTicketById(id);

        if (ticket.getStatus() != TicketStatus.CLOSED && ticket.getStatus() != TicketStatus.REJECTED) {
            throw new IllegalStateException("You can only delete tickets that are CLOSED or REJECTED");
        }

        List<Comment> comments = commentRepository.findByTicketId(id);
        commentRepository.deleteAll(comments);
        ticketRepository.delete(ticket);
    }
}