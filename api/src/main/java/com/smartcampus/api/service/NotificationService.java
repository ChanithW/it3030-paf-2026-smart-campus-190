package com.smartcampus.api.service;

import com.smartcampus.api.exception.ResourceNotFoundException;
import com.smartcampus.api.model.Notification;
import com.smartcampus.api.model.User;
import com.smartcampus.api.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Notification> getNotificationsByUser(String userId) {
        return notificationRepository.findByUserId(userId);
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndRead(userId, false);
    }

    public Notification markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndRead(userId, false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public Notification createNotification(User user, String message, String type, String referenceId) {
        if (!shouldSendNotification(user, type, message)) {
            return null;
        }

        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .read(false)
                .build();
        return notificationRepository.save(notification);
    }

    private boolean shouldSendNotification(User user, String type, String message) {
        if (user.getNotificationPreferences() == null || user.getNotificationPreferences().isEmpty()) {
            return true;
        }

        try {
            Map<String, Object> prefs = objectMapper.readValue(
                user.getNotificationPreferences(), 
                new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {}
            );

            if (type.equals("BOOKING")) {
                String lowerMessage = message.toLowerCase();
                if (lowerMessage.contains("submitted") || lowerMessage.contains("pending")) {
                    return (Boolean) prefs.getOrDefault("bookingSubmitted", true);
                }
                if (lowerMessage.contains("approved")) {
                    return (Boolean) prefs.getOrDefault("bookingApproved", true);
                }
                if (lowerMessage.contains("rejected")) {
                    return (Boolean) prefs.getOrDefault("bookingRejected", true);
                }
            }

            if (type.equals("TICKET")) {
                String lowerMessage = message.toLowerCase();
                if (lowerMessage.contains("in progress") || lowerMessage.contains("resolved") || 
                    lowerMessage.contains("closed") || lowerMessage.contains("rejected")) {
                    return (Boolean) prefs.getOrDefault("ticketStatusChanged", true);
                }
                if (lowerMessage.contains("assigned")) {
                    return (Boolean) prefs.getOrDefault("ticketAssigned", true);
                }
            }

            if (type.equals("COMMENT")) {
                return (Boolean) prefs.getOrDefault("ticketComments", true);
            }

        } catch (Exception e) {
            return true;
        }

        return true;
    }

    public void deleteNotification(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notificationRepository.delete(notification);
    }
}