package com.medicita.app.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class AuthSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        String redirectUrl = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .map(role -> switch (role) {
                    case "ROLE_ADMIN"   -> "/admin/dashboard";
                    case "ROLE_DOCTOR"  -> "/doctor/dashboard";
                    case "ROLE_PATIENT" -> "/patient/dashboard";
                    default             -> "/dashboard";
                })
                .orElse("/dashboard");

        response.sendRedirect(request.getContextPath() + redirectUrl);
    }
}
