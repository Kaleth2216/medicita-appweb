package com.medicita.app.dto.schedule;

import lombok.*;

import java.time.LocalTime;
import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorScheduleDTO {

    private UUID id;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean active;
}
