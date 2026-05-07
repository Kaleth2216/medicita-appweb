package com.medicita.app.repository;

import com.medicita.app.entity.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpecialtyRepository extends JpaRepository<Specialty, UUID> {

    Optional<Specialty> findByName(String name);

    boolean existsByName(String name);

    List<Specialty> findByActiveTrue();
}
