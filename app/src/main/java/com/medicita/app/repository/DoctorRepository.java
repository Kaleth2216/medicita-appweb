package com.medicita.app.repository;

import com.medicita.app.entity.Doctor;
import com.medicita.app.entity.Specialty;
import com.medicita.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    Optional<Doctor> findByUser(User user);

    Optional<Doctor> findByMedicalLicense(String medicalLicense);

    List<Doctor> findBySpecialty(Specialty specialty);

    List<Doctor> findByActiveTrue();

    boolean existsByMedicalLicense(String medicalLicense);
}
