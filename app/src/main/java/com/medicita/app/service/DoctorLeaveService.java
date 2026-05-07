package com.medicita.app.service;

import com.medicita.app.dto.leave.DoctorLeaveDTO;
import com.medicita.app.dto.leave.DoctorLeaveRequest;

import java.util.List;
import java.util.UUID;

public interface DoctorLeaveService {
    DoctorLeaveDTO requestLeave(DoctorLeaveRequest request);
    List<DoctorLeaveDTO> findByCurrentDoctor();
    List<DoctorLeaveDTO> findPending();
    DoctorLeaveDTO approve(UUID id);
    DoctorLeaveDTO reject(UUID id);
    List<DoctorLeaveDTO> findAll();
}
