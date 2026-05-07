package com.medicita.app.service.impl;

import com.medicita.app.dto.patient.PatientDTO;
import com.medicita.app.entity.Patient;
import com.medicita.app.exception.ResourceNotFoundException;
import com.medicita.app.repository.PatientRepository;
import com.medicita.app.service.PatientService;
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
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final UserService userService;

    @Override
    @Transactional(readOnly = true)
    public PatientDTO findById(UUID id) {
        return toDTO(patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id)));
    }

    @Override
    @Transactional(readOnly = true)
    public PatientDTO findByCurrentUser() {
        return toDTO(patientRepository.findByUser(userService.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for current user")));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientDTO> findAll() {
        return patientRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PatientDTO update(UUID id, PatientDTO dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        patient.setPhone(dto.getPhone());
        patient.setBirthDate(dto.getBirthDate());
        patient.setDocumentNumber(dto.getDocumentNumber());
        return toDTO(patientRepository.save(patient));
    }

    private PatientDTO toDTO(Patient patient) {
        return PatientDTO.builder()
                .id(patient.getId())
                .firstName(patient.getUser().getFirstName())
                .lastName(patient.getUser().getLastName())
                .email(patient.getUser().getEmail())
                .documentNumber(patient.getDocumentNumber())
                .phone(patient.getPhone())
                .birthDate(patient.getBirthDate())
                .build();
    }
}
