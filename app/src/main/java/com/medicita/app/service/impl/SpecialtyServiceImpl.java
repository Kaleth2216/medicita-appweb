package com.medicita.app.service.impl;

import com.medicita.app.dto.specialty.SpecialtyDTO;
import com.medicita.app.dto.specialty.SpecialtyRequest;
import com.medicita.app.entity.Specialty;
import com.medicita.app.exception.ResourceNotFoundException;
import com.medicita.app.repository.SpecialtyRepository;
import com.medicita.app.service.SpecialtyService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SpecialtyServiceImpl implements SpecialtyService {

    private final SpecialtyRepository specialtyRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional(readOnly = true)
    public List<SpecialtyDTO> findAll() {
        return specialtyRepository.findAll().stream()
                .map(s -> modelMapper.map(s, SpecialtyDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecialtyDTO> findAllActive() {
        return specialtyRepository.findByActiveTrue().stream()
                .map(s -> modelMapper.map(s, SpecialtyDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SpecialtyDTO findById(UUID id) {
        return modelMapper.map(
                specialtyRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Specialty", "id", id)),
                SpecialtyDTO.class);
    }

    @Override
    public SpecialtyDTO create(SpecialtyRequest request) {
        if (specialtyRepository.existsByName(request.getName())) {
            throw new RuntimeException("Specialty already exists with name: " + request.getName());
        }
        Specialty specialty = modelMapper.map(request, Specialty.class);
        return modelMapper.map(specialtyRepository.save(specialty), SpecialtyDTO.class);
    }

    @Override
    public SpecialtyDTO update(UUID id, SpecialtyRequest request) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialty", "id", id));
        specialty.setName(request.getName());
        specialty.setDescription(request.getDescription());
        return modelMapper.map(specialtyRepository.save(specialty), SpecialtyDTO.class);
    }

    @Override
    public void delete(UUID id) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialty", "id", id));
        specialty.setActive(false);
        specialtyRepository.save(specialty);
    }

    @Override
    public void activate(UUID id) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialty", "id", id));
        specialty.setActive(true);
        specialtyRepository.save(specialty);
    }
}
