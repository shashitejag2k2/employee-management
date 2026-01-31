import { httpClient } from './httpClient';
import type { PageResponse } from '../types/employee';
import type { Department } from '../types/department';

export type ListDepartmentsParams = {
  page: number;
  size: number;
  sort?: string;
};

export async function listDepartments(
  params: ListDepartmentsParams,
): Promise<PageResponse<Department>> {
  const response = await httpClient.get<PageResponse<Department>>('/departments', {
    params: {
      page: params.page,
      size: params.size,
      sort: params.sort,
    },
  });

  return response.data;
}
