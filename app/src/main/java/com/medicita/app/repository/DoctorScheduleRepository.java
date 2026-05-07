package com.medicita.app.repository;

import com.medicita.app.entity.Doctor;
import com.medicita.app.entity.DoctorSchedule;
import com.medicita.app.enums.Weekday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, UUID> {

    List<DoctorSchedule> findByDoctor(Doctor doctor);

    List<DoctorSchedule> findByDoctorAndActiveTrue(Doctor doctor);

    Optional<DoctorSchedule> findByDoctorAndWeekDay(Doctor doctor, Weekday weekDay);
}
