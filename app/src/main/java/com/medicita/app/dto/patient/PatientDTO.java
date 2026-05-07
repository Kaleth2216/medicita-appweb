package com.medicita.app.dto.patient;

import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientDTO {

    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String documentNumber;
    private String phone;
    private LocalDate birthDate;
}
