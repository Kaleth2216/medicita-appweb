package com.medicita.app.controller;

import com.medicita.app.dto.appointment.AppointmentRequest;
import com.medicita.app.dto.doctor.DoctorDTO;
import com.medicita.app.service.AppointmentService;
import com.medicita.app.service.DoctorService;
import com.medicita.app.service.PatientService;
import com.medicita.app.service.SpecialtyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.UUID;

@Controller
@RequestMapping("/patient")
@PreAuthorize("hasRole('PATIENT')")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final AppointmentService appointmentService;
    private final SpecialtyService specialtyService;
    private final DoctorService doctorService;

    @GetMapping("/appointments")
    public String appointments(@RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "10") int size,
                               Model model) {
        model.addAttribute("appointments",
                appointmentService.findByCurrentPatient(PageRequest.of(page, size)));
        return "patient/appointments";
    }

    @GetMapping("/appointments/new")
    public String newAppointmentForm(Model model) {
        model.addAttribute("appointmentRequest", new AppointmentRequest());
        model.addAttribute("specialties", specialtyService.findAllActive());
        return "patient/appointment-form";
    }

    @GetMapping("/appointments/new/doctors")
    @ResponseBody
    public List<DoctorDTO> getDoctorsBySpecialty(@RequestParam UUID specialtyId) {
        return doctorService.findBySpecialty(specialtyId);
    }

    @PostMapping("/appointments")
    public String bookAppointment(@Valid @ModelAttribute("appointmentRequest") AppointmentRequest request,
                                  BindingResult bindingResult,
                                  Model model,
                                  RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("specialties", specialtyService.findAllActive());
            return "patient/appointment-form";
        }
        try {
            appointmentService.create(request);
            redirectAttributes.addFlashAttribute("success", "Appointment booked successfully.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/patient/appointments";
    }

    @PostMapping("/appointments/{id}/cancel")
    public String cancelAppointment(@PathVariable UUID id, RedirectAttributes redirectAttributes) {
        appointmentService.cancel(id);
        redirectAttributes.addFlashAttribute("success", "Appointment cancelled.");
        return "redirect:/patient/appointments";
    }

    @GetMapping("/history")
    public String history(Model model) {
        model.addAttribute("appointments",
                appointmentService.findByCurrentPatient(Pageable.unpaged()).getContent());
        return "patient/history";
    }

    @GetMapping("/profile")
    public String profile(Model model) {
        model.addAttribute("patient", patientService.findByCurrentUser());
        return "patient/profile";
    }
}
