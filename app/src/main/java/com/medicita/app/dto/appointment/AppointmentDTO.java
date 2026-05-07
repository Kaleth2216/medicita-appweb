package com.medicita.app.dto.appointment;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentDTO {

    private UUID id;
    private String patientFullName;
    private String doctorFullName;
    private String specialtyName;
    private LocalDateTime appointmentDateTime;
    private String status;
    private String reason;
    private String notes;
}
