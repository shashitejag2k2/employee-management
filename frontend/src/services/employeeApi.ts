import { httpClient } from './httpClient';
import type {
  Employee,
  EmployeeCreateRequest,
  EmployeeRole,
  EmployeeStatus,
  EmployeeUpdateRequest,
  PageResponse,
} from '../types/employee';

export type ListEmployeesParams = {
  page: number;
  size: number;
  sort?: string;
  departmentId?: string;
  role?: EmployeeRole;
  status?: EmployeeStatus;
  search?: string;
};

export async function listEmployees(
  params: ListEmployeesParams,
): Promise<PageResponse<Employee>> {
  const response = await httpClient.get<PageResponse<Employee>>('/employees', {
    params: {
      page: params.page,
      size: params.size,
      sort: params.sort,
      departmentId: params.departmentId,
      role: params.role,
      status: params.status,
      search: params.search?.trim() ? params.search.trim() : undefined,
    },
  });

  return response.data;
}

export async function getEmployeeById(id: string): Promise<Employee> {
  const response = await httpClient.get<Employee>(`/employees/${id}`);
  return response.data;
}

export async function createEmployee(payload: EmployeeCreateRequest): Promise<Employee> {
  const response = await httpClient.post<Employee>('/employees', payload);
  return response.data;
}

export async function updateEmployee(id: string, payload: EmployeeUpdateRequest): Promise<Employee> {
  const response = await httpClient.put<Employee>(`/employees/${id}`, payload);
  return response.data;
}

export async function softDeleteEmployee(id: string): Promise<void> {
  await httpClient.delete(`/employees/${id}`);
}
