package com.medicita.app.service.impl;

import com.medicita.app.dto.schedule.DoctorScheduleDTO;
import com.medicita.app.dto.schedule.DoctorScheduleRequest;
import com.medicita.app.entity.Doctor;
import com.medicita.app.entity.DoctorSchedule;
import com.medicita.app.exception.ResourceNotFoundException;
import com.medicita.app.repository.DoctorRepository;
import com.medicita.app.repository.DoctorScheduleRepository;
import com.medicita.app.service.DoctorScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorScheduleServiceImpl implements DoctorScheduleService {

    private final DoctorScheduleRepository doctorScheduleRepository;
    private final DoctorRepository doctorRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DoctorScheduleDTO> findByDoctor(UUID doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));
        return doctorScheduleRepository.findByDoctor(doctor).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DoctorScheduleDTO create(UUID doctorId, DoctorScheduleRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));
        DoctorSchedule schedule = DoctorSchedule.builder()
                .doctor(doctor)
                .weekDay(request.getWeekDay())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();
        return toDTO(doctorScheduleRepository.save(schedule));
    }

    @Override
    public DoctorScheduleDTO update(UUID scheduleId, DoctorScheduleRequest request) {
        DoctorSchedule schedule = doctorScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorSchedule", "id", scheduleId));
        schedule.setWeekDay(request.getWeekDay());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        return toDTO(doctorScheduleRepository.save(schedule));
    }

    @Override
    public void delete(UUID scheduleId) {
        DoctorSchedule schedule = doctorScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorSchedule", "id", scheduleId));
        schedule.setActive(false);
        doctorScheduleRepository.save(schedule);
    }

    private DoctorScheduleDTO toDTO(DoctorSchedule schedule) {
        return DoctorScheduleDTO.builder()
                .id(schedule.getId())
                .dayOfWeek(schedule.getWeekDay().name())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .active(schedule.isActive())
                .build();
    }
}
