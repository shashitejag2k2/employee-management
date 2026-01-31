import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import type { Employee } from '../types/employee';
import { getEmployeeById } from '../services/employeeApi';

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const e = await getEmployeeById(id);
        setEmployee(e);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load employee');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={600}>
            Employee Details
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate('/employees')}>
              Back
            </Button>
            {id && (
              <Button variant="contained" onClick={() => navigate(`/employees/${id}/edit`)}>
                Edit
              </Button>
            )}
          </Stack>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Paper sx={{ p: 2 }}>
          {loading && <Typography>Loading...</Typography>}
          {!loading && employee && (
            <Stack spacing={1.25}>
              <Typography variant="subtitle1" fontWeight={600}>
                {employee.firstName} {employee.lastName}
              </Typography>
              <Divider />
              <Typography><strong>ID:</strong> {employee.id}</Typography>
              <Typography><strong>Email:</strong> {employee.email}</Typography>
              <Typography><strong>Phone:</strong> {employee.phone ?? '-'}</Typography>
              <Typography><strong>Designation:</strong> {employee.designation}</Typography>
              <Typography><strong>Salary:</strong> {employee.salary}</Typography>
              <Typography><strong>Department ID:</strong> {employee.departmentId}</Typography>
              <Typography><strong>Role:</strong> {employee.role}</Typography>
              <Typography><strong>Status:</strong> {employee.status}</Typography>
              <Typography><strong>Created:</strong> {employee.createdAt}</Typography>
              <Typography><strong>Updated:</strong> {employee.updatedAt}</Typography>
            </Stack>
          )}
        </Paper>
      </Stack>
    </Box>
  );
}
