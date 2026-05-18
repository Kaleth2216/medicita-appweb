package com.medicita.app.config;

import com.medicita.app.entity.User;
import com.medicita.app.enums.Role;
import com.medicita.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (!userRepository.existsByEmail("admin@medicita.com")) {
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("MediCita")
                    .email("admin@medicita.com")
                    .password(passwordEncoder.encode("Admin2026*"))
                    .role(Role.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("Admin user created: admin@medicita.com");
        }
    }
}
