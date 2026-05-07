package com.medicita.app.dto.appointment;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentRequest {

    @NotNull
    private UUID doctorId;

    @NotNull
    @Future
    private LocalDateTime appointmentDateTime;

    @NotBlank
    private String reason;
}
