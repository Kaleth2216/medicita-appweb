package com.medicita.app.service;

import com.medicita.app.dto.schedule.DoctorScheduleDTO;
import com.medicita.app.dto.schedule.DoctorScheduleRequest;

import java.util.List;
import java.util.UUID;

public interface DoctorScheduleService {
    List<DoctorScheduleDTO> findByDoctor(UUID doctorId);
    DoctorScheduleDTO create(UUID doctorId, DoctorScheduleRequest request);
    DoctorScheduleDTO update(UUID scheduleId, DoctorScheduleRequest request);
    void delete(UUID scheduleId);
}
