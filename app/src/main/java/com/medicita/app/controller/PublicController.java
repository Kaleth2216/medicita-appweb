package com.medicita.app.controller;

import com.medicita.app.dto.common.ApiResponse;
import com.medicita.app.service.DoctorService;
import com.medicita.app.service.SpecialtyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final SpecialtyService specialtyService;
    private final DoctorService doctorService;

    @PostMapping("/hash")
    public ResponseEntity<ApiResponse<?>> hash(@RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("hash", new BCryptPasswordEncoder().encode(body.get("password"))));
    }

    @GetMapping("/specialties")
    public ResponseEntity<ApiResponse<?>> getSpecialties() {
        return ResponseEntity.ok(ApiResponse.success("Specialties retrieved", specialtyService.findAllActive()));
    }

    @GetMapping("/specialties/{id}/doctors")
    public ResponseEntity<ApiResponse<?>> getDoctorsBySpecialty(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved", doctorService.findBySpecialty(id)));
    }
}
