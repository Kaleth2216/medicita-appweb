package com.medicita.app.repository;

import com.medicita.app.entity.Appointment;
import com.medicita.app.entity.Doctor;
import com.medicita.app.entity.Patient;
import com.medicita.app.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findByPatient(Patient patient);

    Page<Appointment> findByPatient(Patient patient, Pageable pageable);

    List<Appointment> findByDoctor(Doctor doctor);

    List<Appointment> findByDoctorAndStatus(Doctor doctor, AppointmentStatus status);

    List<Appointment> findByPatientAndStatus(Patient patient, AppointmentStatus status);

    List<Appointment> findByDoctorAndDateTimeBetween(Doctor doctor, LocalDateTime start, LocalDateTime end);

    boolean existsByDoctorAndDateTime(Doctor doctor, LocalDateTime dateTime);
}
