package com.ems.auth.service;

import com.ems.auth.dto.AuthResponse;
import com.ems.auth.dto.LoginRequest;
import com.ems.auth.dto.RegisterRequest;
import com.ems.auth.entity.AuthUser;
import com.ems.auth.repository.AuthUserRepository;
import com.ems.common.exception.ConflictException;
import com.ems.common.exception.UnauthorizedException;
import com.ems.employee.dto.EmployeeResponse;
import com.ems.employee.entity.Employee;
import com.ems.employee.entity.EmployeeStatus;
import com.ems.employee.mapper.EmployeeMapper;
import com.ems.employee.repository.EmployeeRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.UUID;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final long EXPIRES_IN_SECONDS = 3600;

    private final AuthUserRepository authUserRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    private final EmployeeMapper employeeMapper = new EmployeeMapper();

    public AuthServiceImpl(AuthUserRepository authUserRepository, EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.authUserRepository = authUserRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        AuthUser user = authUserRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        AuthResponse resp = new AuthResponse();
        resp.setAccessToken(generateOpaqueToken());
        resp.setTokenType("Bearer");
        resp.setExpiresIn(EXPIRES_IN_SECONDS);
        return resp;
    }

    @Override
    public EmployeeResponse register(RegisterRequest request) {
        if (employeeRepository.existsByEmailIgnoreCase(request.getEmail()) || authUserRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ConflictException("Employee with email already exists");
        }

        Employee employee = new Employee();
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setDesignation(request.getDesignation());
        employee.setSalary(request.getSalary());
        employee.setDepartmentId(request.getDepartmentId());
        employee.setRole(request.getRole());
        employee.setStatus(EmployeeStatus.ACTIVE);

        Employee savedEmployee = employeeRepository.save(employee);

        AuthUser authUser = new AuthUser();
        authUser.setEmployeeId(savedEmployee.getId());
        authUser.setEmail(savedEmployee.getEmail());
        authUser.setRole(savedEmployee.getRole());
        authUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        authUserRepository.save(authUser);

        return employeeMapper.toResponse(savedEmployee);
    }

    private String generateOpaqueToken() {
        String raw = UUID.randomUUID().toString() + ":" + UUID.randomUUID();
        return Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes());
    }
}
