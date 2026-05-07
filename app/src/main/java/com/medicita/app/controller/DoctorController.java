package com.medicita.app.controller;

import com.medicita.app.dto.appointment.AppointmentStatusUpdateRequest;
import com.medicita.app.dto.common.ApiResponse;
import com.medicita.app.dto.leave.DoctorLeaveRequest;
import com.medicita.app.enums.AppointmentStatus;
import com.medicita.app.service.AppointmentService;
import com.medicita.app.service.DoctorLeaveService;
import com.medicita.app.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
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

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctor")
@PreAuthorize("hasRole('DOCTOR')")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final AppointmentService appointmentService;
    private final DoctorLeaveService doctorLeaveService;

    @GetMapping("/schedule")
    public ResponseEntity<ApiResponse<?>> getSchedule(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        if (weekStart == null) {
            weekStart = LocalDate.now().with(DayOfWeek.MONDAY);
        }
        var doctor = doctorService.findCurrentDoctor();
        return ResponseEntity.ok(ApiResponse.success("Schedule retrieved",
                appointmentService.findByDoctorWeekly(doctor.getId(), weekStart)));
    }

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<?>> getAppointments() {
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved",
                appointmentService.findByCurrentDoctor()));
    }

    @PutMapping("/appointments/{id}/complete")
    public ResponseEntity<ApiResponse<?>> completeAppointment(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        return ResponseEntity.ok(ApiResponse.success("Appointment completed",
                appointmentService.updateStatus(id,
                        new AppointmentStatusUpdateRequest(AppointmentStatus.COMPLETED, notes))));
    }

    @PutMapping("/appointments/{id}/cancel")
    public ResponseEntity<ApiResponse<?>> cancelAppointment(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled",
                appointmentService.updateStatus(id,
                        new AppointmentStatusUpdateRequest(AppointmentStatus.CANCELLED, null))));
    }

    @GetMapping("/leaves")
    public ResponseEntity<ApiResponse<?>> getLeaves() {
        return ResponseEntity.ok(ApiResponse.success("Leaves retrieved",
                doctorLeaveService.findByCurrentDoctor()));
    }

    @PostMapping("/leaves")
    public ResponseEntity<ApiResponse<?>> requestLeave(@Valid @RequestBody DoctorLeaveRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Leave request submitted",
                        doctorLeaveService.requestLeave(request)));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<?>> getProfile() {
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved",
                doctorService.findCurrentDoctor()));
    }
}
