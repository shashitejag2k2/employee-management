package com.ems.auth.service;

import com.ems.auth.dto.AuthResponse;
import com.ems.auth.dto.LoginRequest;
import com.ems.auth.dto.RegisterRequest;
import com.ems.employee.dto.EmployeeResponse;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    EmployeeResponse register(RegisterRequest request);
}
