package com.medicita.app.controller;

import com.medicita.app.dto.doctor.DoctorDTO;
import com.medicita.app.dto.doctor.DoctorRequest;
import com.medicita.app.dto.specialty.SpecialtyRequest;
import com.medicita.app.service.AppointmentService;
import com.medicita.app.service.DoctorLeaveService;
import com.medicita.app.service.DoctorService;
import com.medicita.app.service.SpecialtyService;
import com.medicita.app.service.UserService;
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

import java.util.UUID;

@Controller
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final DoctorService doctorService;
    private final SpecialtyService specialtyService;
    private final DoctorLeaveService doctorLeaveService;
    private final AppointmentService appointmentService;
    private final UserService userService;

    // ── Doctors ──────────────────────────────────────────────────────────────

    @GetMapping("/doctors")
    public String doctors(Model model) {
        model.addAttribute("doctors", doctorService.findAll());
        return "admin/doctors";
    }

    @GetMapping("/doctors/new")
    public String newDoctorForm(Model model) {
        model.addAttribute("doctorRequest", new DoctorRequest());
        model.addAttribute("specialties", specialtyService.findAllActive());
        return "admin/doctor-form";
    }

    @PostMapping("/doctors")
    public String createDoctor(@Valid @ModelAttribute("doctorRequest") DoctorRequest request,
                               BindingResult bindingResult,
                               Model model,
                               RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("specialties", specialtyService.findAllActive());
            return "admin/doctor-form";
        }
        try {
            doctorService.create(request);
            redirectAttributes.addFlashAttribute("success", "Doctor created successfully.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/doctors";
    }

    @GetMapping("/doctors/{id}/edit")
    public String editDoctorForm(@PathVariable UUID id, Model model) {
        DoctorDTO doctor = doctorService.findById(id);
        DoctorRequest request = new DoctorRequest();
        request.setFirstName(doctor.getFirstName());
        request.setLastName(doctor.getLastName());
        request.setEmail(doctor.getEmail());
        request.setMedicalLicense(doctor.getMedicalLicense());
        model.addAttribute("doctorRequest", request);
        model.addAttribute("doctorId", id);
        model.addAttribute("specialties", specialtyService.findAllActive());
        return "admin/doctor-form";
    }

    @PostMapping("/doctors/{id}")
    public String updateDoctor(@PathVariable UUID id,
                               @Valid @ModelAttribute("doctorRequest") DoctorRequest request,
                               BindingResult bindingResult,
                               Model model,
                               RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("doctorId", id);
            model.addAttribute("specialties", specialtyService.findAllActive());
            return "admin/doctor-form";
        }
        try {
            doctorService.update(id, request);
            redirectAttributes.addFlashAttribute("success", "Doctor updated successfully.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/doctors";
    }

    @PostMapping("/doctors/{id}/deactivate")
    public String deactivateDoctor(@PathVariable UUID id, RedirectAttributes redirectAttributes) {
        doctorService.deactivate(id);
        redirectAttributes.addFlashAttribute("success", "Doctor deactivated.");
        return "redirect:/admin/doctors";
    }

    // ── Specialties ──────────────────────────────────────────────────────────

    @GetMapping("/specialties")
    public String specialties(Model model) {
        model.addAttribute("specialties", specialtyService.findAll());
        model.addAttribute("specialtyRequest", new SpecialtyRequest());
        return "admin/specialties";
    }

    @PostMapping("/specialties")
    public String createSpecialty(@Valid @ModelAttribute("specialtyRequest") SpecialtyRequest request,
                                  BindingResult bindingResult,
                                  Model model,
                                  RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("specialties", specialtyService.findAll());
            return "admin/specialties";
        }
        specialtyService.create(request);
        redirectAttributes.addFlashAttribute("success", "Specialty created.");
        return "redirect:/admin/specialties";
    }

    @PostMapping("/specialties/{id}")
    public String updateSpecialty(@PathVariable UUID id,
                                  @Valid @ModelAttribute("specialtyRequest") SpecialtyRequest request,
                                  BindingResult bindingResult,
                                  Model model,
                                  RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("specialties", specialtyService.findAll());
            return "admin/specialties";
        }
        specialtyService.update(id, request);
        redirectAttributes.addFlashAttribute("success", "Specialty updated.");
        return "redirect:/admin/specialties";
    }

    @PostMapping("/specialties/{id}/delete")
    public String deleteSpecialty(@PathVariable UUID id, RedirectAttributes redirectAttributes) {
        specialtyService.delete(id);
        redirectAttributes.addFlashAttribute("success", "Specialty deactivated.");
        return "redirect:/admin/specialties";
    }

    // ── Leaves ───────────────────────────────────────────────────────────────

    @GetMapping("/leaves")
    public String leaves(Model model) {
        model.addAttribute("leaves", doctorLeaveService.findPending());
        return "admin/leaves";
    }

    @PostMapping("/leaves/{id}/approve")
    public String approveLeave(@PathVariable UUID id, RedirectAttributes redirectAttributes) {
        doctorLeaveService.approve(id);
        redirectAttributes.addFlashAttribute("success", "Leave approved.");
        return "redirect:/admin/leaves";
    }

    @PostMapping("/leaves/{id}/reject")
    public String rejectLeave(@PathVariable UUID id, RedirectAttributes redirectAttributes) {
        doctorLeaveService.reject(id);
        redirectAttributes.addFlashAttribute("success", "Leave rejected.");
        return "redirect:/admin/leaves";
    }

    // ── Appointments ─────────────────────────────────────────────────────────

    @GetMapping("/appointments")
    public String appointments(Model model) {
        model.addAttribute("appointments", appointmentService.findAll());
        return "admin/appointments";
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public String users(Model model) {
        model.addAttribute("users", userService.findAll());
        return "admin/users";
    }

    @PostMapping("/users/{id}/deactivate")
    public String deactivateUser(@PathVariable UUID id, RedirectAttributes redirectAttributes) {
        userService.deactivate(id);
        redirectAttributes.addFlashAttribute("success", "User deactivated.");
        return "redirect:/admin/users";
    }

    @PostMapping("/users/{id}/activate")
    public String activateUser(@PathVariable UUID id, RedirectAttributes redirectAttributes) {
        userService.activate(id);
        redirectAttributes.addFlashAttribute("success", "User activated.");
        return "redirect:/admin/users";
    }
}
