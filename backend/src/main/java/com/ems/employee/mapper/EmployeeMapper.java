package com.ems.employee.mapper;

import com.ems.employee.dto.EmployeeCreateRequest;
import com.ems.employee.dto.EmployeeResponse;
import com.ems.employee.dto.EmployeeUpdateRequest;
import com.ems.employee.entity.Employee;
import com.ems.employee.entity.EmployeeStatus;

public class EmployeeMapper {

    public EmployeeResponse toResponse(Employee entity) {
        EmployeeResponse dto = new EmployeeResponse();
        dto.setId(entity.getId());
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        dto.setDesignation(entity.getDesignation());
        dto.setSalary(entity.getSalary());
        dto.setDepartmentId(entity.getDepartmentId());
        dto.setRole(entity.getRole());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public Employee toNewEntity(EmployeeCreateRequest req) {
        Employee e = new Employee();
        e.setFirstName(req.getFirstName());
        e.setLastName(req.getLastName());
        e.setEmail(req.getEmail());
        e.setPhone(req.getPhone());
        e.setDesignation(req.getDesignation());
        e.setSalary(req.getSalary());
        e.setDepartmentId(req.getDepartmentId());
        e.setRole(req.getRole());
        e.setStatus(req.getStatus() != null ? req.getStatus() : EmployeeStatus.ACTIVE);
        return e;
    }

    public void applyUpdate(Employee target, EmployeeUpdateRequest req) {
        target.setFirstName(req.getFirstName());
        target.setLastName(req.getLastName());
        target.setEmail(req.getEmail());
        target.setPhone(req.getPhone());
        target.setDesignation(req.getDesignation());
        target.setSalary(req.getSalary());
        target.setDepartmentId(req.getDepartmentId());
        target.setRole(req.getRole());
        target.setStatus(req.getStatus());
    }
}
