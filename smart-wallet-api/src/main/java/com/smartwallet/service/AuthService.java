package com.smartwallet.service;

import com.smartwallet.dto.AuthenticationResponse;
import com.smartwallet.dto.LoginRequest;
import com.smartwallet.dto.RegisterRequest;
import com.smartwallet.model.User;
import com.smartwallet.repository.UserRepository;
import com.smartwallet.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final WalletService walletService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        if (isBlank(request.getUsername()) || isBlank(request.getEmail()) || isBlank(request.getPassword())) {
            throw new IllegalArgumentException("Username, email and password are required");
        }
        if (userRepository.findByUsername(request.getUsername().trim()).isPresent()) {
            throw new IllegalArgumentException("Username already in use");
        }
        if (userRepository.findByEmail(request.getEmail().trim()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        var user = User.builder()
                .username(request.getUsername().trim())
                .email(request.getEmail().trim())
                .fullName(request.getFullName())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(new HashSet<>(Set.of("ROLE_USER")))
                .build();

        var savedUser = userRepository.save(user);
        walletService.createWalletForUser(savedUser);

        return AuthenticationResponse.builder()
                .token(jwtService.generateToken(savedUser))
                .build();
    }

    public AuthenticationResponse authenticate(LoginRequest request) {
        String identifier = request.getUsername() != null ? request.getUsername().trim() : "";
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(identifier, request.getPassword())
        );

        var user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return AuthenticationResponse.builder()
                .token(jwtService.generateToken(user))
                .build();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}