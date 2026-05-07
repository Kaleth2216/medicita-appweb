package com.medicita.app;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGeneratorTest {

    @Test
    void printHash() {
        String hash = new BCryptPasswordEncoder().encode("Admin2026*");
        System.out.println("\n>>> HASH: " + hash + "\n");
    }
}
