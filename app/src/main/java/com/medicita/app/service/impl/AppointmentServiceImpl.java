package com.medicita.app.service.impl;

import com.medicita.app.dto.appointment.AppointmentDTO;
import com.medicita.app.dto.appointment.AppointmentRequest;
import com.medicita.app.dto.appointment.AppointmentStatusUpdateRequest;
import com.medicita.app.entity.Appointment;
import com.medicita.app.entity.Doctor;
import com.medicita.app.entity.Patient;
import com.medicita.app.enums.AppointmentStatus;
import com.medicita.app.enums.LeaveStatus;
import com.medicita.app.exception.ResourceNotFoundException;
import com.medicita.app.repository.AppointmentRepository;
import com.medicita.app.repository.DoctorLeaveRepository;
import com.medicita.app.repository.DoctorRepository;
import com.medicita.app.repository.PatientRepository;
import com.medicita.app.service.AppointmentService;
import com.medicita.app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorLeaveRepository doctorLeaveRepository;
    private final UserService userService;

    @Override
    public AppointmentDTO create(AppointmentRequest request) {
        Patient patient = patientRepository.findByUser(userService.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for current user"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", request.getDoctorId()));

        if (!doctor.isActive()) {
            throw new RuntimeException("Doctor is not currently active");
        }
        if (appointmentRepository.existsByDoctorAndDateTime(doctor, request.getAppointmentDateTime())) {
            throw new RuntimeException("Doctor already has an appointment at the requested time");
        }

        LocalDate appointmentDate = request.getAppointmentDateTime().toLocalDate();
        boolean onLeave = doctorLeaveRepository.findByDoctorAndStatus(doctor, LeaveStatus.APPROVED)
                .stream()
                .anyMatch(leave -> !appointmentDate.isBefore(leave.getStartDate())
                        && !appointmentDate.isAfter(leave.getEndDate()));
        if (onLeave) {
            throw new RuntimeException("Doctor is on approved leave on the selected date");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .dateTime(request.getAppointmentDateTime())
                .reason(request.getReason())
                .build();
        return toDTO(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentDTO> findByCurrentPatient(Pageable pageable) {
        Patient patient = patientRepository.findByUser(userService.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for current user"));
        return appointmentRepository.findByPatient(patient, pageable).map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> findByCurrentDoctor() {
        Doctor doctor = doctorRepository.findByUser(userService.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for current user"));
        return appointmentRepository.findByDoctor(doctor).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> findByDoctorWeekly(UUID doctorId, LocalDate weekStart) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));
        return appointmentRepository.findByDoctorAndDateTimeBetween(
                        doctor,
                        weekStart.atStartOfDay(),
                        weekStart.plusDays(6).atTime(23, 59, 59))
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentDTO updateStatus(UUID id, AppointmentStatusUpdateRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        appointment.setStatus(request.getStatus());
        if (request.getNotes() != null) {
            appointment.setNotes(request.getNotes());
        }
        return toDTO(appointmentRepository.save(appointment));
    }

    @Override
    public void cancel(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        if (!appointment.getPatient().getUser().getId().equals(userService.getCurrentUser().getId())) {
            throw new RuntimeException("Only the patient who made this appointment can cancel it");
        }
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> findAll() {
        return appointmentRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private AppointmentDTO toDTO(Appointment appointment) {
        Doctor doctor = appointment.getDoctor();
        Patient patient = appointment.getPatient();
        return AppointmentDTO.builder()
                .id(appointment.getId())
                .patientFullName(patient.getUser().getFirstName() + " " + patient.getUser().getLastName())
                .doctorFullName(doctor.getUser().getFirstName() + " " + doctor.getUser().getLastName())
                .specialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null)
                .appointmentDateTime(appointment.getDateTime())
                .status(appointment.getStatus().name())
                .reason(appointment.getReason())
                .notes(appointment.getNotes())
                .build();
    }
}
