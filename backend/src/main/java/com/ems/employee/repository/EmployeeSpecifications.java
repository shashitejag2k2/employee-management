package com.ems.employee.repository;

import com.ems.employee.entity.Employee;
import com.ems.employee.entity.EmployeeRole;
import com.ems.employee.entity.EmployeeStatus;

import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public final class EmployeeSpecifications {

    private EmployeeSpecifications() {
    }

    public static Specification<Employee> departmentId(UUID departmentId) {
        return (root, query, cb) -> departmentId == null ? cb.conjunction() : cb.equal(root.get("departmentId"), departmentId);
    }

    public static Specification<Employee> role(EmployeeRole role) {
        return (root, query, cb) -> role == null ? cb.conjunction() : cb.equal(root.get("role"), role);
    }

    public static Specification<Employee> status(EmployeeStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }
}
