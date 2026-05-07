package com.medicita.app.dto.specialty;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecialtyRequest {

    @NotBlank
    private String name;

    private String description;
}
