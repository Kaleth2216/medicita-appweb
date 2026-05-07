package com.medicita.app.controller;

import com.medicita.app.dto.appointment.AppointmentStatusUpdateRequest;
import com.medicita.app.dto.leave.DoctorLeaveRequest;
import com.medicita.app.enums.AppointmentStatus;
import com.medicita.app.service.AppointmentService;
import com.medicita.app.service.DoctorLeaveService;
import com.medicita.app.service.DoctorScheduleService;
import com.medicita.app.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.UUID;

@Controller
@RequestMapping("/doctor")
@PreAuthorize("hasRole('DOCTOR')")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final AppointmentService appointmentService;
    private final DoctorLeaveService doctorLeaveService;
    private final DoctorScheduleService doctorScheduleService;

    @GetMapping("/schedule")
    public String schedule(Model model) {
        var doctor = doctorService.findCurrentDoctor();
        LocalDate weekStart = LocalDate.now().with(DayOfWeek.MONDAY);
        model.addAttribute("weekStart", weekStart);
        model.addAttribute("schedule", doctorScheduleService.findByDoctor(doctor.getId()));
        model.addAttribute("weeklyAppointments",
                appointmentService.findByDoctorWeekly(doctor.getId(), weekStart));
        return "doctor/schedule";
    }

    @GetMapping("/appointments")
    public String appointments(Model model) {
        model.addAttribute("appointments", appointmentService.findByCurrentDoctor());
        return "doctor/appointments";
    }

    @PostMapping("/appointments/{id}/complete")
    public String completeAppointment(@PathVariable UUID id, RedirectAttributes redirectAttributes) {
        appointmentService.updateStatus(id,
                new AppointmentStatusUpdateRequest(AppointmentStatus.COMPLETED, null));
        redirectAttributes.addFlashAttribute("success", "Appointment marked as completed.");
        return "redirect:/doctor/appointments";
    }

    @PostMapping("/appointments/{id}/cancel")
    public String cancelAppointment(@PathVariable UUID id, RedirectAttributes redirectAttributes) {
        appointmentService.updateStatus(id,
                new AppointmentStatusUpdateRequest(AppointmentStatus.CANCELLED, null));
        redirectAttributes.addFlashAttribute("success", "Appointment cancelled.");
        return "redirect:/doctor/appointments";
    }

    @GetMapping("/leaves")
    public String leaves(Model model) {
        model.addAttribute("leaves", doctorLeaveService.findByCurrentDoctor());
        return "doctor/leaves";
    }

    @GetMapping("/leaves/new")
    public String newLeaveForm(Model model) {
        model.addAttribute("leaveRequest", new DoctorLeaveRequest());
        return "doctor/leave-form";
    }

    @PostMapping("/leaves")
    public String requestLeave(@Valid @ModelAttribute("leaveRequest") DoctorLeaveRequest request,
                               BindingResult bindingResult,
                               RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            return "doctor/leave-form";
        }
        doctorLeaveService.requestLeave(request);
        redirectAttributes.addFlashAttribute("success", "Leave request submitted.");
        return "redirect:/doctor/leaves";
    }

    @GetMapping("/profile")
    public String profile(Model model) {
        model.addAttribute("doctor", doctorService.findCurrentDoctor());
        return "doctor/profile";
    }
}
