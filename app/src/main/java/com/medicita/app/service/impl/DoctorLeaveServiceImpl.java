package com.medicita.app.service.impl;

import com.medicita.app.dto.leave.DoctorLeaveDTO;
import com.medicita.app.dto.leave.DoctorLeaveRequest;
import com.medicita.app.entity.Doctor;
import com.medicita.app.entity.DoctorLeave;
import com.medicita.app.enums.LeaveStatus;
import com.medicita.app.exception.ResourceNotFoundException;
import com.medicita.app.repository.DoctorLeaveRepository;
import com.medicita.app.repository.DoctorRepository;
import com.medicita.app.service.DoctorLeaveService;
import com.medicita.app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorLeaveServiceImpl implements DoctorLeaveService {

    private final DoctorLeaveRepository doctorLeaveRepository;
    private final DoctorRepository doctorRepository;
    private final UserService userService;

    @Override
    public DoctorLeaveDTO requestLeave(DoctorLeaveRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date must be after or equal to start date");
        }

        Doctor doctor = doctorRepository.findByUser(userService.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for current user"));

        if (doctorLeaveRepository.existsByDoctorAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                doctor, request.getEndDate(), request.getStartDate())) {
            throw new RuntimeException("A leave request already exists overlapping the selected dates");
        }

        DoctorLeave leave = DoctorLeave.builder()
                .doctor(doctor)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .type(request.getType())
                .reason(request.getReason())
                .build();
        return toDTO(doctorLeaveRepository.save(leave));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorLeaveDTO> findByCurrentDoctor() {
        Doctor doctor = doctorRepository.findByUser(userService.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for current user"));
        return doctorLeaveRepository.findByDoctor(doctor).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorLeaveDTO> findPending() {
        return doctorLeaveRepository.findByStatus(LeaveStatus.PENDING).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DoctorLeaveDTO approve(UUID id) {
        DoctorLeave leave = doctorLeaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorLeave", "id", id));
        leave.setStatus(LeaveStatus.APPROVED);
        return toDTO(doctorLeaveRepository.save(leave));
    }

    @Override
    public DoctorLeaveDTO reject(UUID id) {
        DoctorLeave leave = doctorLeaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorLeave", "id", id));
        leave.setStatus(LeaveStatus.REJECTED);
        return toDTO(doctorLeaveRepository.save(leave));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorLeaveDTO> findAll() {
        return doctorLeaveRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private DoctorLeaveDTO toDTO(DoctorLeave leave) {
        String fullName = leave.getDoctor().getUser().getFirstName()
                + " " + leave.getDoctor().getUser().getLastName();
        return DoctorLeaveDTO.builder()
                .id(leave.getId())
                .doctorFullName(fullName)
                .startDate(leave.getStartDate())
                .endDate(leave.getEndDate())
                .type(leave.getType() != null ? leave.getType().name() : null)
                .status(leave.getStatus().name())
                .reason(leave.getReason())
                .build();
    }
}
