package com.medicita.app.controller;

import com.medicita.app.dto.appointment.AppointmentDTO;
import com.medicita.app.dto.appointment.AppointmentRequest;
import com.medicita.app.dto.common.ApiResponse;
import com.medicita.app.dto.common.PagedResponse;
import com.medicita.app.service.AppointmentService;
import com.medicita.app.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/patient")
@PreAuthorize("hasRole('PATIENT')")
@RequiredArgsConstructor
public class PatientController {

    private final AppointmentService appointmentService;
    private final PatientService patientService;

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<?>> getAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AppointmentDTO> result = appointmentService.findByCurrentPatient(PageRequest.of(page, size));
        PagedResponse<AppointmentDTO> paged = PagedResponse.<AppointmentDTO>builder()
                .content(result.getContent())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved", paged));
    }

    @PostMapping("/appointments")
    public ResponseEntity<ApiResponse<?>> bookAppointment(@Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment booked", appointmentService.create(request)));
    }

    @PutMapping("/appointments/{id}/cancel")
    public ResponseEntity<ApiResponse<?>> cancelAppointment(@PathVariable UUID id) {
        appointmentService.cancel(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled", null));
    }

    @GetMapping("/appointments/history")
    public ResponseEntity<ApiResponse<?>> getHistory() {
        return ResponseEntity.ok(ApiResponse.success("History retrieved",
                appointmentService.findByCurrentPatient(Pageable.unpaged()).getContent()));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<?>> getProfile() {
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved",
                patientService.findByCurrentUser()));
    }
}
