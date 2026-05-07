package com.medicita.app.dto.user;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {

    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private boolean active;
}
