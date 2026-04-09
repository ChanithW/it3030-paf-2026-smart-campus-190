package com.smartcampus.api.repository;

import com.smartcampus.api.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findByTicketId(String ticketId);
    List<Comment> findByUserId(String userId);
}
