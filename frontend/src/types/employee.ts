export type EmployeeRole = 'ADMIN' | 'HR' | 'EMPLOYEE';
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  designation: string;
  salary: number;
  departmentId: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeCreateRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  designation: string;
  salary: number;
  departmentId: string;
  role: EmployeeRole;
  status?: EmployeeStatus;
};

export type EmployeeUpdateRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  designation: string;
  salary: number;
  departmentId: string;
  role: EmployeeRole;
  status: EmployeeStatus;
};

export type ApiErrorResponse = {
  timestamp: string;
  status: number;
  error: string;
  code: string;
  message: string;
  path: string;
  correlationId: string;
  details?: Array<{ field: string; issue: string }>;
};

export type PageMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type PageResponse<T> = {
  items: T[];
  meta: PageMeta;
};
