package com.medicita.app.controller;

import com.medicita.app.dto.appointment.AppointmentDTO;
import com.medicita.app.service.AppointmentService;
import com.medicita.app.service.DoctorService;
import com.medicita.app.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class DashboardController {

    private final AppointmentService appointmentService;
    private final DoctorService doctorService;
    private final PatientService patientService;

    @GetMapping("/dashboard")
    public String dashboard(Authentication authentication) {
        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("");
        return switch (role) {
            case "ROLE_ADMIN"   -> "redirect:/admin/dashboard";
            case "ROLE_DOCTOR"  -> "redirect:/doctor/dashboard";
            case "ROLE_PATIENT" -> "redirect:/patient/dashboard";
            default             -> "redirect:/login";
        };
    }

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminDashboard(Model model) {
        long pendingCount = appointmentService.findAll().stream()
                .filter(a -> "PENDING".equals(a.getStatus()))
                .count();
        model.addAttribute("totalDoctors", doctorService.findAll().size());
        model.addAttribute("totalPatients", patientService.findAll().size());
        model.addAttribute("pendingAppointments", pendingCount);
        return "admin/dashboard";
    }

    @GetMapping("/doctor/dashboard")
    @PreAuthorize("hasRole('DOCTOR')")
    public String doctorDashboard(Model model) {
        List<AppointmentDTO> todayAppointments = appointmentService.findByCurrentDoctor().stream()
                .filter(a -> a.getAppointmentDateTime().toLocalDate().equals(LocalDate.now()))
                .collect(Collectors.toList());
        model.addAttribute("todayAppointments", todayAppointments);
        return "doctor/dashboard";
    }

    @GetMapping("/patient/dashboard")
    @PreAuthorize("hasRole('PATIENT')")
    public String patientDashboard(Model model) {
        model.addAttribute("upcomingAppointments",
                appointmentService.findByCurrentPatient(PageRequest.of(0, 5)).getContent());
        return "patient/dashboard";
    }
}
