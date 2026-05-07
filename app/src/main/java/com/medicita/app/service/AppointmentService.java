package com.medicita.app.service;

import com.medicita.app.dto.appointment.AppointmentDTO;
import com.medicita.app.dto.appointment.AppointmentRequest;
import com.medicita.app.dto.appointment.AppointmentStatusUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AppointmentService {
    AppointmentDTO create(AppointmentRequest request);
    Page<AppointmentDTO> findByCurrentPatient(Pageable pageable);
    List<AppointmentDTO> findByCurrentDoctor();
    List<AppointmentDTO> findByDoctorWeekly(UUID doctorId, LocalDate weekStart);
    AppointmentDTO updateStatus(UUID id, AppointmentStatusUpdateRequest request);
    void cancel(UUID id);
    List<AppointmentDTO> findAll();
}
