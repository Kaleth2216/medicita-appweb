package com.medicita.app.controller;

import com.medicita.app.dto.common.ApiResponse;
import com.medicita.app.dto.doctor.DoctorRequest;
import com.medicita.app.dto.specialty.SpecialtyRequest;
import com.medicita.app.service.AppointmentService;
import com.medicita.app.service.DoctorLeaveService;
import com.medicita.app.service.DoctorService;
import com.medicita.app.service.PatientService;
import com.medicita.app.service.SpecialtyService;
import com.medicita.app.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final DoctorService doctorService;
    private final SpecialtyService specialtyService;
    private final DoctorLeaveService doctorLeaveService;
    private final AppointmentService appointmentService;
    private final PatientService patientService;
    private final UserService userService;

    // ── Doctors ──────────────────────────────────────────────────────────────

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<?>> getDoctors() {
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved", doctorService.findAll()));
    }

    @PostMapping("/doctors")
    public ResponseEntity<ApiResponse<?>> createDoctor(@Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Doctor created", doctorService.create(request)));
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<ApiResponse<?>> updateDoctor(@PathVariable UUID id,
                                                       @Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Doctor updated", doctorService.update(id, request)));
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<ApiResponse<?>> deactivateDoctor(@PathVariable UUID id) {
        doctorService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor deactivated", null));
    }

    // ── Specialties ──────────────────────────────────────────────────────────

    @GetMapping("/specialties")
    public ResponseEntity<ApiResponse<?>> getSpecialties() {
        return ResponseEntity.ok(ApiResponse.success("Specialties retrieved", specialtyService.findAll()));
    }

    @PostMapping("/specialties")
    public ResponseEntity<ApiResponse<?>> createSpecialty(@Valid @RequestBody SpecialtyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Specialty created", specialtyService.create(request)));
    }

    @PutMapping("/specialties/{id}")
    public ResponseEntity<ApiResponse<?>> updateSpecialty(@PathVariable UUID id,
                                                          @Valid @RequestBody SpecialtyRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Specialty updated", specialtyService.update(id, request)));
    }

    @DeleteMapping("/specialties/{id}")
    public ResponseEntity<ApiResponse<?>> deleteSpecialty(@PathVariable UUID id) {
        specialtyService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Specialty deactivated", null));
    }

    // ── Leaves ───────────────────────────────────────────────────────────────

    @GetMapping("/leaves")
    public ResponseEntity<ApiResponse<?>> getPendingLeaves() {
        return ResponseEntity.ok(ApiResponse.success("Pending leaves retrieved", doctorLeaveService.findPending()));
    }

    @PutMapping("/leaves/{id}/approve")
    public ResponseEntity<ApiResponse<?>> approveLeave(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Leave approved", doctorLeaveService.approve(id)));
    }

    @PutMapping("/leaves/{id}/reject")
    public ResponseEntity<ApiResponse<?>> rejectLeave(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Leave rejected", doctorLeaveService.reject(id)));
    }

    // ── Appointments ─────────────────────────────────────────────────────────

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<?>> getAppointments() {
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved", appointmentService.findAll()));
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<?>> getUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", userService.findAll()));
    }

    @PutMapping("/users/{id}/deactivate")
    public ResponseEntity<ApiResponse<?>> deactivateUser(@PathVariable UUID id) {
        userService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success("User deactivated", null));
    }

    @PutMapping("/users/{id}/activate")
    public ResponseEntity<ApiResponse<?>> activateUser(@PathVariable UUID id) {
        userService.activate(id);
        return ResponseEntity.ok(ApiResponse.success("User activated", null));
    }

    // ── Dashboard ─────────────────────────────────────────────────────────────

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<?>> getDashboardStats() {
        long pendingAppointments = appointmentService.findAll().stream()
                .filter(a -> "PENDING".equals(a.getStatus()))
                .count();
        Map<String, Object> stats = Map.of(
                "totalDoctors", doctorService.findAll().size(),
                "totalPatients", patientService.findAll().size(),
                "pendingAppointments", pendingAppointments,
                "pendingLeaves", (long) doctorLeaveService.findPending().size()
        );
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved", stats));
    }
}
