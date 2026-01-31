package com.ems.department.mapper;

import com.ems.department.dto.DepartmentCreateRequest;
import com.ems.department.dto.DepartmentResponse;
import com.ems.department.dto.DepartmentUpdateRequest;
import com.ems.department.entity.Department;

public class DepartmentMapper {

    public DepartmentResponse toResponse(Department entity) {
        DepartmentResponse dto = new DepartmentResponse();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public Department toNewEntity(DepartmentCreateRequest req) {
        Department d = new Department();
        d.setName(req.getName());
        d.setDescription(req.getDescription());
        return d;
    }

    public void applyUpdate(Department target, DepartmentUpdateRequest req) {
        target.setName(req.getName());
        target.setDescription(req.getDescription());
    }
}
