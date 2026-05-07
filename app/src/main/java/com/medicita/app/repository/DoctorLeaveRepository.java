package com.medicita.app.repository;

import com.medicita.app.entity.Doctor;
import com.medicita.app.entity.DoctorLeave;
import com.medicita.app.enums.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface DoctorLeaveRepository extends JpaRepository<DoctorLeave, UUID> {

    List<DoctorLeave> findByDoctor(Doctor doctor);

    List<DoctorLeave> findByStatus(LeaveStatus status);

    List<DoctorLeave> findByDoctorAndStatus(Doctor doctor, LeaveStatus status);

    boolean existsByDoctorAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Doctor doctor, LocalDate endDate, LocalDate startDate);
}
