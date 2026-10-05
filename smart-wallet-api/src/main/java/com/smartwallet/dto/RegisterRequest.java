package com.smartwallet.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String fullName;
    // Pas de champ "roles" : le rôle est attribué côté serveur (évite l'auto-attribution de ROLE_ADMIN)
}
