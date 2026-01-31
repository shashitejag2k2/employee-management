package com.ems.employee.service;

import com.ems.common.exception.ConflictException;
import com.ems.common.exception.NotFoundException;
import com.ems.common.pagination.PageMeta;
import com.ems.common.pagination.PageResponse;
import com.ems.employee.dto.EmployeeCreateRequest;
import com.ems.employee.dto.EmployeeResponse;
import com.ems.employee.dto.EmployeeUpdateRequest;
import com.ems.employee.entity.Employee;
import com.ems.employee.entity.EmployeeRole;
import com.ems.employee.entity.EmployeeStatus;
import com.ems.employee.mapper.EmployeeMapper;
import com.ems.employee.repository.EmployeeRepository;
import com.ems.employee.repository.EmployeeSpecifications;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper = new EmployeeMapper();

    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public EmployeeResponse create(EmployeeCreateRequest request) {
        if (employeeRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ConflictException("Employee with email already exists");
        }
        Employee employee = employeeMapper.toNewEntity(request);
        Employee saved = employeeRepository.save(employee);
        return employeeMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponse> list(Pageable pageable, UUID departmentId, EmployeeRole role, EmployeeStatus status) {
        Specification<Employee> spec = Specification
                .where(EmployeeSpecifications.departmentId(departmentId))
                .and(EmployeeSpecifications.role(role))
                .and(EmployeeSpecifications.status(status));

        Page<Employee> page = employeeRepository.findAll(spec, pageable);

        return new PageResponse<>(
                page.getContent().stream().map(employeeMapper::toResponse).toList(),
                new PageMeta(pageable.getPageNumber(), pageable.getPageSize(), page.getTotalElements(), page.getTotalPages())
        );
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getById(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found"));
        return employeeMapper.toResponse(employee);
    }

    @Override
    public EmployeeResponse update(UUID id, EmployeeUpdateRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found"));

        if (employeeRepository.existsByEmailIgnoreCaseAndIdNot(request.getEmail(), id)) {
            throw new ConflictException("Employee with email already exists");
        }

        employeeMapper.applyUpdate(employee, request);
        Employee saved = employeeRepository.save(employee);
        return employeeMapper.toResponse(saved);
    }

    @Override
    public void softDelete(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found"));

        employee.setStatus(EmployeeStatus.INACTIVE);
        employeeRepository.save(employee);
    }
}
