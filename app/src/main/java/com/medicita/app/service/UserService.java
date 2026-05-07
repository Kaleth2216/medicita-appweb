package com.medicita.app.service;

import com.medicita.app.dto.user.UserDTO;
import com.medicita.app.entity.User;

import java.util.List;
import java.util.UUID;

public interface UserService {
    UserDTO findById(UUID id);
    List<UserDTO> findAll();
    void deactivate(UUID id);
    void activate(UUID id);
    User getCurrentUser();
}
