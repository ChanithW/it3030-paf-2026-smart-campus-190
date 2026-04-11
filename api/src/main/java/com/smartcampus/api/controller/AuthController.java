package com.smartcampus.api.controller;

import com.smartcampus.api.enums.Role;
import com.smartcampus.api.model.User;
import com.smartcampus.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(
            @AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        String picture = principal.getAttribute("picture");
        User user = userService.createOrUpdateUser(email, name, picture);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/technicians")
    public ResponseEntity<List<User>> getTechnicians() {
        List<User> technicians = userService.getAllUsers().stream()
                .filter(u -> u.getRole() == Role.TECHNICIAN)
                .collect(Collectors.toList());
        return ResponseEntity.ok(technicians);
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        Role role = Role.valueOf(request.get("role"));
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @PatchMapping("/users/preferences")
    public ResponseEntity<User> updateNotificationPreferences(
        @AuthenticationPrincipal OAuth2User principal,
        @RequestBody Map<String, String> request) {
        String email = principal.getAttribute("email");
        User user = userService.getUserByEmail(email);
        user.setNotificationPreferences(request.get("preferences"));
        return ResponseEntity.ok(userService.saveUser(user));
    }
}
