package com.medicita.app.dto.schedule;

import com.medicita.app.enums.Weekday;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorScheduleRequest {

    @NotNull
    private Weekday weekDay;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;
}
