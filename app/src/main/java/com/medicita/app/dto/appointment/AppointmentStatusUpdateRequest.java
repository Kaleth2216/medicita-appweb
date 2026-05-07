package com.medicita.app.dto.appointment;

import com.medicita.app.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentStatusUpdateRequest {

    @NotNull
    private AppointmentStatus status;

    private String notes;
}
