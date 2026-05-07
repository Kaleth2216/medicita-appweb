package com.medicita.app.dto.leave;

import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorLeaveDTO {

    private UUID id;
    private String doctorFullName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String type;
    private String status;
    private String reason;
}
