package com.medicita.app.repository;

import com.medicita.app.entity.Patient;
import com.medicita.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {

    Optional<Patient> findByUser(User user);

    Optional<Patient> findByDocumentNumber(String documentNumber);

    boolean existsByDocumentNumber(String documentNumber);
}
