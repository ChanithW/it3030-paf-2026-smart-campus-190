package com.smartcampus.api.service;

import com.smartcampus.api.dto.CommentRequest;
import com.smartcampus.api.dto.StatusUpdateRequest;
import com.smartcampus.api.dto.TicketRequest;
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

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsByUser(String userId) {
        return ticketRepository.findByUserId(userId);
    }

    public List<Ticket> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatus(status);
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
        return ticketRepository.save(ticket);
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
        }

        return ticketRepository.save(ticket);
    }

    public Comment addComment(String ticketId, CommentRequest request, User user) {
        Ticket ticket = getTicketById(ticketId);
        Comment comment = Comment.builder()
                .ticket(ticket)
                .user(user)
                .content(request.getContent())
                .build();
        return commentRepository.save(comment);
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
}