package com.medicita.app.service.impl;

import com.medicita.app.dto.doctor.DoctorDTO;
import com.medicita.app.dto.doctor.DoctorRequest;
import com.medicita.app.entity.Doctor;
import com.medicita.app.entity.Specialty;
import com.medicita.app.entity.User;
import com.medicita.app.enums.Role;
import com.medicita.app.exception.ResourceNotFoundException;
import com.medicita.app.repository.DoctorRepository;
import com.medicita.app.repository.SpecialtyRepository;
import com.medicita.app.repository.UserRepository;
import com.medicita.app.service.DoctorService;
import com.medicita.app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final SpecialtyRepository specialtyRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    @Override
    @Transactional(readOnly = true)
    public List<DoctorDTO> findAll() {
        return doctorRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorDTO> findBySpecialty(UUID specialtyId) {
        Specialty specialty = specialtyRepository.findById(specialtyId)
                .orElseThrow(() -> new ResourceNotFoundException("Specialty", "id", specialtyId));
        return doctorRepository.findBySpecialty(specialty).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorDTO findById(UUID id) {
        return toDTO(doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id)));
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorDTO findCurrentDoctor() {
        return toDTO(doctorRepository.findByUser(userService.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for current user")));
    }

    @Override
    public DoctorDTO create(DoctorRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }
        if (doctorRepository.existsByMedicalLicense(request.getMedicalLicense())) {
            throw new RuntimeException("Medical license already registered: " + request.getMedicalLicense());
        }

        Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                .orElseThrow(() -> new ResourceNotFoundException("Specialty", "id", request.getSpecialtyId()));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.DOCTOR)
                .build();
        userRepository.save(user);

        Doctor doctor = Doctor.builder()
                .user(user)
                .medicalLicense(request.getMedicalLicense())
                .specialty(specialty)
                .build();
        return toDTO(doctorRepository.save(doctor));
    }

    @Override
    public DoctorDTO update(UUID id, DoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                .orElseThrow(() -> new ResourceNotFoundException("Specialty", "id", request.getSpecialtyId()));

        User user = doctor.getUser();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        userRepository.save(user);

        doctor.setMedicalLicense(request.getMedicalLicense());
        doctor.setSpecialty(specialty);
        return toDTO(doctorRepository.save(doctor));
    }

    @Override
    public void deactivate(UUID id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        doctor.setActive(false);
        doctor.getUser().setActive(false);
        userRepository.save(doctor.getUser());
        doctorRepository.save(doctor);
    }

    @Override
    public void activate(UUID id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        doctor.setActive(true);
        doctor.getUser().setActive(true);
        userRepository.save(doctor.getUser());
        doctorRepository.save(doctor);
    }

    private DoctorDTO toDTO(Doctor doctor) {
        return DoctorDTO.builder()
                .id(doctor.getId())
                .firstName(doctor.getUser().getFirstName())
                .lastName(doctor.getUser().getLastName())
                .email(doctor.getUser().getEmail())
                .medicalLicense(doctor.getMedicalLicense())
                .specialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null)
                .active(doctor.isActive())
                .build();
    }
}
