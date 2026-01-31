package com.ems.department.service;

import com.ems.common.pagination.PageResponse;
import com.ems.department.dto.DepartmentCreateRequest;
import com.ems.department.dto.DepartmentResponse;
import com.ems.department.dto.DepartmentUpdateRequest;

import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface DepartmentService {

    DepartmentResponse create(DepartmentCreateRequest request);

    PageResponse<DepartmentResponse> list(Pageable pageable);

    DepartmentResponse getById(UUID id);

    DepartmentResponse update(UUID id, DepartmentUpdateRequest request);

    void delete(UUID id);
}
