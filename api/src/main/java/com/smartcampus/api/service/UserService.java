package com.smartcampus.api.service;

import com.smartcampus.api.enums.Role;
import com.smartcampus.api.exception.ResourceNotFoundException;
import com.smartcampus.api.model.User;
import com.smartcampus.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public User createOrUpdateUser(String email, String name, String profilePicture) {
        return userRepository.findByEmail(email)
                .map(existingUser -> {
                    existingUser.setLastLoginAt(LocalDateTime.now());
                    // Only set isNewUser to false after second login
                    if (Boolean.TRUE.equals(existingUser.getIsNewUser())) {
                        existingUser.setIsNewUser(false);
                    }
                    existingUser.setProfilePicture(profilePicture);
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    // Brand new user - first time login
                    User newUser = User.builder()
                            .email(email)
                            .name(name)
                            .profilePicture(profilePicture)
                            .role(Role.USER)
                            .isNewUser(true)
                            .lastLoginAt(LocalDateTime.now())
                            .build();
                    return userRepository.save(newUser);
                });
    }

    public User updateUserRole(String id, Role role) {
        User user = getUserById(id);
        user.setRole(role);
        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }
}
