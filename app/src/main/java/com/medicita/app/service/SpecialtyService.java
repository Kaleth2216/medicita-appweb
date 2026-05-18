package com.medicita.app.service;

import com.medicita.app.dto.specialty.SpecialtyDTO;
import com.medicita.app.dto.specialty.SpecialtyRequest;

import java.util.List;
import java.util.UUID;

public interface SpecialtyService {
    List<SpecialtyDTO> findAll();
    List<SpecialtyDTO> findAllActive();
    SpecialtyDTO findById(UUID id);
    SpecialtyDTO create(SpecialtyRequest request);
    SpecialtyDTO update(UUID id, SpecialtyRequest request);
    void delete(UUID id);
    void activate(UUID id);
}
