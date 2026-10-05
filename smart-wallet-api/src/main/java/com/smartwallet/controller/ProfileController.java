package com.smartwallet.controller;

import com.smartwallet.dto.ProfileResponse;
import com.smartwallet.dto.UpdateProfileRequest;
import com.smartwallet.model.User;
import com.smartwallet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(ProfileResponse.fromUser(user));
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateMyProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request
    ) {
        User user = getCurrentUser(authentication);

        // L'email est obligatoire et unique : on conserve l'actuel si absent, on refuse un doublon
        String email = request.getEmail();
        if (email != null && !email.isBlank()) {
            String trimmedEmail = email.trim();
            userRepository.findByEmail(trimmedEmail)
                    .filter(other -> !other.getId().equals(user.getId()))
                    .ifPresent(other -> {
                        throw new IllegalArgumentException("Email already in use");
                    });
            user.setEmail(trimmedEmail);
        }
        user.setFullName(request.getFullName());
        user.setAvatarUrl(request.getAvatarUrl());

        User savedUser = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.OK).body(ProfileResponse.fromUser(savedUser));
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}