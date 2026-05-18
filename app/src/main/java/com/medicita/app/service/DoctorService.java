package com.medicita.app.service;

import com.medicita.app.dto.doctor.DoctorDTO;
import com.medicita.app.dto.doctor.DoctorRequest;

import java.util.List;
import java.util.UUID;

public interface DoctorService {
    List<DoctorDTO> findAll();
    List<DoctorDTO> findBySpecialty(UUID specialtyId);
    DoctorDTO findById(UUID id);
    DoctorDTO findCurrentDoctor();
    DoctorDTO create(DoctorRequest request);
    DoctorDTO update(UUID id, DoctorRequest request);
    void deactivate(UUID id);
    void activate(UUID id);
}
