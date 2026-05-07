package com.medicita.app.service;

import com.medicita.app.dto.auth.AuthResponse;
import com.medicita.app.dto.auth.LoginRequest;
import com.medicita.app.dto.auth.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
