import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import type {
  EmployeeCreateRequest,
  EmployeeRole,
  EmployeeStatus,
  EmployeeUpdateRequest,
} from '../types/employee';
import {
  createEmployee,
  getEmployeeById,
  updateEmployee,
} from '../services/employeeApi';
import { listDepartments } from '../services/departmentApi';
import type { Department } from '../types/department';

type FieldErrors = Partial<Record<keyof EmployeeUpdateRequest, string>>;

const roles: EmployeeRole[] = ['ADMIN', 'HR', 'EMPLOYEE'];
const statuses: EmployeeStatus[] = ['ACTIVE', 'INACTIVE'];

function validate(payload: EmployeeUpdateRequest | EmployeeCreateRequest): FieldErrors {
  const errors: FieldErrors = {};

  const isBlank = (v?: string | null) => !v || !v.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (isBlank(payload.firstName)) errors.firstName = 'First name is required';
  if (isBlank(payload.lastName)) errors.lastName = 'Last name is required';
  if (isBlank(payload.email)) errors.email = 'Email is required';
  else if (!emailRegex.test(payload.email)) errors.email = 'Invalid email format';

  if (!isBlank(payload.phone) && payload.phone && payload.phone.length < 7) {
    errors.phone = 'Phone must be at least 7 characters';
  }

  if (isBlank(payload.designation)) errors.designation = 'Designation is required';

  if (payload.salary === undefined || payload.salary === null || Number.isNaN(payload.salary)) {
    errors.salary = 'Salary is required';
  } else if (Number(payload.salary) < 0) {
    errors.salary = 'Salary must be >= 0';
  }

  if (isBlank(payload.departmentId)) errors.departmentId = 'Department ID is required';
  else if (!uuidRegex.test(payload.departmentId)) {
    errors.departmentId = 'Department ID must be a valid UUID';
  }
  if (!payload.role) errors.role = 'Role is required';

  // status is required only for update payload; create payload defaults to ACTIVE
  if ('status' in payload && !payload.status) {
    errors.status = 'Status is required';
  }

  return errors;
}

export default function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState<string | null>(null);

  const [form, setForm] = useState<EmployeeUpdateRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: '',
    salary: 0,
    departmentId: '',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
  });

  const title = useMemo(() => (isEdit ? 'Edit Employee' : 'Create Employee'), [isEdit]);

  useEffect(() => {
    const loadDepartments = async () => {
      setDepartmentsLoading(true);
      setDepartmentsError(null);
      try {
        const res = await listDepartments({ page: 0, size: 100, sort: 'name,asc' });
        setDepartments(res.items);

        if (res.items.length && !form.departmentId) {
          setForm((p) => ({ ...p, departmentId: res.items[0].id }));
        }
      } catch (err: any) {
        setDepartmentsError(
          err?.response?.data?.message || err?.message || 'Failed to load departments',
        );
      } finally {
        setDepartmentsLoading(false);
      }
    };

    void loadDepartments();
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const e = await getEmployeeById(id);
        setForm({
          firstName: e.firstName,
          lastName: e.lastName,
          email: e.email,
          phone: e.phone ?? '',
          designation: e.designation,
          salary: e.salary,
          departmentId: e.departmentId,
          role: e.role,
          status: e.status,
        });
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load employee');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, isEdit]);

  const onSubmit = async () => {
    setError(null);

    const errs = validate(form);
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      if (isEdit && id) {
        await updateEmployee(id, form);
      } else {
        const payload: EmployeeCreateRequest = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone?.trim() ? form.phone : undefined,
          designation: form.designation,
          salary: form.salary,
          departmentId: form.departmentId,
          role: form.role,
          status: form.status,
        };
        await createEmployee(payload);
      }

      navigate('/employees');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            {title}
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {departmentsError && <Alert severity="warning">{departmentsError}</Alert>}

        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="First name"
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                error={Boolean(fieldErrors.firstName)}
                helperText={fieldErrors.firstName}
                fullWidth
              />
              <TextField
                label="Last name"
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                error={Boolean(fieldErrors.lastName)}
                helperText={fieldErrors.lastName}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
                fullWidth
              />
              <TextField
                label="Phone"
                value={form.phone ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                error={Boolean(fieldErrors.phone)}
                helperText={fieldErrors.phone}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Designation"
                value={form.designation}
                onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
                error={Boolean(fieldErrors.designation)}
                helperText={fieldErrors.designation}
                fullWidth
              />
              <TextField
                label="Salary"
                type="number"
                value={form.salary}
                onChange={(e) => setForm((p) => ({ ...p, salary: Number(e.target.value) }))}
                error={Boolean(fieldErrors.salary)}
                helperText={fieldErrors.salary}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Department"
                value={form.departmentId}
                onChange={(e) => setForm((p) => ({ ...p, departmentId: e.target.value }))}
                error={Boolean(fieldErrors.departmentId)}
                helperText={fieldErrors.departmentId}
                fullWidth
                disabled={departmentsLoading}
              >
                <MenuItem value="">
                  <em>Select department</em>
                </MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </TextField>
              {departmentsLoading && (
                <Stack direction="row" alignItems="center" sx={{ px: 1 }}>
                  <CircularProgress size={20} />
                </Stack>
              )}
              <TextField
                select
                label="Role"
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value as EmployeeRole }))
                }
                error={Boolean(fieldErrors.role)}
                helperText={fieldErrors.role}
                fullWidth
              >
                {roles.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Status"
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value as EmployeeStatus }))
                }
                error={Boolean(fieldErrors.status)}
                helperText={fieldErrors.status}
                fullWidth
              >
                {statuses.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => navigate('/employees')} disabled={loading}>
                Cancel
              </Button>
              <Button variant="contained" onClick={onSubmit} disabled={loading}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
