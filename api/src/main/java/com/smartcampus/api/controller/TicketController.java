package com.smartcampus.api.controller;

import com.smartcampus.api.dto.CommentRequest;
import com.smartcampus.api.dto.StatusUpdateRequest;
import com.smartcampus.api.dto.TicketRequest;
import com.smartcampus.api.enums.TicketStatus;
import com.smartcampus.api.model.Comment;
import com.smartcampus.api.model.Ticket;
import com.smartcampus.api.model.User;
import com.smartcampus.api.service.TicketService;
import com.smartcampus.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final UserService userService;
    private final String uploadDir = "uploads/";
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets(
            @RequestParam(required = false) TicketStatus status) {
        if (status != null) {
            return ResponseEntity.ok(ticketService.getTicketsByStatus(status));
        }
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Ticket>> getMyTickets(
            @AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getUserByEmail(principal.getAttribute("email"));
        return ResponseEntity.ok(ticketService.getTicketsByUser(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(
            @Valid @RequestBody TicketRequest request,
            @AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getUserByEmail(principal.getAttribute("email"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(request, user));
    }

    @PostMapping("/with-attachments")
    public ResponseEntity<Ticket> createTicketWithAttachments(
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("priority") String priority,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "contactDetails", required = false) String contactDetails,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal OAuth2User principal) throws IOException {

        User user = userService.getUserByEmail(principal.getAttribute("email"));

        List<String> attachmentUrls = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            int count = 0;
            for (MultipartFile file : files) {
                if (file.isEmpty() || count >= 3) continue;

                String contentType = file.getContentType();
                if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Invalid file type. Only JPG, PNG, GIF, and WEBP images are allowed.");
                }

                String originalFilename = file.getOriginalFilename();
                String extension = originalFilename != null
                        ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                        : ".jpg";
                String filename = UUID.randomUUID() + extension;
                Path filePath = uploadPath.resolve(filename);
                Files.write(filePath, file.getBytes());
                attachmentUrls.add("/api/files/" + filename);
                count++;
            }
        }

        TicketRequest request = new TicketRequest();
        request.setCategory(category);
        request.setDescription(description);
        request.setPriority(priority);
        request.setLocation(location);
        request.setContactDetails(contactDetails);

        Ticket ticket = ticketService.createTicket(request, user);

        if (!attachmentUrls.isEmpty()) {
            ticket.setAttachments(attachmentUrls);
            ticket = ticketService.saveTicket(ticket);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getCommentsByTicket(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Comment> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getUserByEmail(principal.getAttribute("email"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.addComment(id, request, user));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<Comment> updateComment(
            @PathVariable String commentId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getUserByEmail(principal.getAttribute("email"));
        return ResponseEntity.ok(ticketService.updateComment(commentId, request, user));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String commentId,
            @AuthenticationPrincipal OAuth2User principal) {
        User user = userService.getUserByEmail(principal.getAttribute("email"));
        ticketService.deleteComment(commentId, user);
        return ResponseEntity.noContent().build();
    }
}
