package com.ems.employee.service;

import com.ems.common.pagination.PageResponse;
import com.ems.employee.dto.EmployeeCreateRequest;
import com.ems.employee.dto.EmployeeResponse;
import com.ems.employee.dto.EmployeeUpdateRequest;
import com.ems.employee.entity.EmployeeRole;
import com.ems.employee.entity.EmployeeStatus;

import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface EmployeeService {

    EmployeeResponse create(EmployeeCreateRequest request);

    PageResponse<EmployeeResponse> list(Pageable pageable, UUID departmentId, EmployeeRole role, EmployeeStatus status);

    EmployeeResponse getById(UUID id);

    EmployeeResponse update(UUID id, EmployeeUpdateRequest request);

    void softDelete(UUID id);
}
