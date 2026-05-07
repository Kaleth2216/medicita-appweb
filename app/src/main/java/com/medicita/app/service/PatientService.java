package com.medicita.app.service;

import com.medicita.app.dto.patient.PatientDTO;

import java.util.List;
import java.util.UUID;

public interface PatientService {
    PatientDTO findById(UUID id);
    PatientDTO findByCurrentUser();
    List<PatientDTO> findAll();
    PatientDTO update(UUID id, PatientDTO dto);
}
