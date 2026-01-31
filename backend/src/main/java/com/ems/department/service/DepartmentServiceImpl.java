package com.ems.department.service;

import com.ems.common.exception.ConflictException;
import com.ems.common.exception.NotFoundException;
import com.ems.common.pagination.PageMeta;
import com.ems.common.pagination.PageResponse;
import com.ems.department.dto.DepartmentCreateRequest;
import com.ems.department.dto.DepartmentResponse;
import com.ems.department.dto.DepartmentUpdateRequest;
import com.ems.department.entity.Department;
import com.ems.department.mapper.DepartmentMapper;
import com.ems.department.repository.DepartmentRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper = new DepartmentMapper();

    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public DepartmentResponse create(DepartmentCreateRequest request) {
        if (departmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("Department with name already exists");
        }

        Department entity = departmentMapper.toNewEntity(request);
        Department saved = departmentRepository.save(entity);
        return departmentMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DepartmentResponse> list(Pageable pageable) {
        Page<Department> page = departmentRepository.findAll(pageable);
        return new PageResponse<>(
                page.getContent().stream().map(departmentMapper::toResponse).toList(),
                new PageMeta(pageable.getPageNumber(), pageable.getPageSize(), page.getTotalElements(), page.getTotalPages())
        );
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentResponse getById(UUID id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department not found"));
        return departmentMapper.toResponse(dept);
    }

    @Override
    public DepartmentResponse update(UUID id, DepartmentUpdateRequest request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department not found"));

        if (departmentRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new ConflictException("Department with name already exists");
        }

        departmentMapper.applyUpdate(dept, request);
        Department saved = departmentRepository.save(dept);
        return departmentMapper.toResponse(saved);
    }

    @Override
    public void delete(UUID id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Department not found"));
        departmentRepository.delete(dept);
    }
}
