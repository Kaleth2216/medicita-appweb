package com.medicita.app.dto.doctor;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorDTO {

    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String medicalLicense;
    private String specialtyName;
    private boolean active;
}
