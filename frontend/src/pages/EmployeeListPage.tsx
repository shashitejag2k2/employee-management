import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

import type { Employee } from '../types/employee';
import { listEmployees, softDeleteEmployee } from '../services/employeeApi';

function toSortParam(sortModel: GridSortModel): string | undefined {
  if (!sortModel.length) return undefined;
  const s = sortModel[0];
  if (!s.field) return undefined;
  const dir = s.sort ?? 'asc';
  return `${s.field},${dir}`;
}

export default function EmployeeListPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<Employee[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'createdAt', sort: 'desc' },
  ]);

  const [searchInput, setSearchInput] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const t = window.setTimeout(() => {
      setPaginationModel((p) => ({ ...p, page: 0 }));
      setSearch(searchInput);
    }, 350);

    return () => window.clearTimeout(t);
  }, [searchInput]);

  const columns: GridColDef<Employee>[] = useMemo(
    () => [
      { field: 'firstName', headerName: 'First name', flex: 1, minWidth: 150 },
      { field: 'lastName', headerName: 'Last name', flex: 1, minWidth: 150 },
      { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 220 },
      { field: 'designation', headerName: 'Designation', flex: 1, minWidth: 170 },
      {
        field: 'salary',
        headerName: 'Salary',
        flex: 0.7,
        minWidth: 120,
        type: 'number',
      },
      { field: 'role', headerName: 'Role', flex: 0.7, minWidth: 120 },
      { field: 'status', headerName: 'Status', flex: 0.7, minWidth: 120 },
      {
        field: 'createdAt',
        headerName: 'Created',
        flex: 0.9,
        minWidth: 180,
        valueGetter: (value) => value,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        filterable: false,
        width: 240,
        renderCell: (params) => (
          <Stack direction="row" spacing={1} sx={{ py: 1 }}>
            <Button size="small" onClick={() => navigate(`/employees/${params.row.id}`)}>
              View
            </Button>
            <Button size="small" onClick={() => navigate(`/employees/${params.row.id}/edit`)}>
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => setDeleteId(params.row.id)}
            >
              Delete
            </Button>
          </Stack>
        ),
      },
    ],
    [navigate],
  );

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await listEmployees({
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sort: toSortParam(sortModel),
        status: 'ACTIVE',
        search,
      });

      setRows(res.items);
      setTotal(res.meta.totalElements);
    } catch (e: any) {
      const message =
        e?.response?.data?.message || e?.message || 'Failed to load employees';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel.page, paginationModel.pageSize, sortModel, search]);

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Employees
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Browse employees with server-side pagination, sorting, and search.
            </Typography>
          </Box>

          <Button variant="contained" onClick={() => navigate('/employees/new')}>
            Create Employee
          </Button>
        </Stack>

        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Search"
              placeholder="Name / email"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              fullWidth
            />
            <Button
              variant="outlined"
              onClick={() => {
                setSearchInput('');
              }}
            >
              Clear
            </Button>
            <Button variant="contained" onClick={fetchData}>
              Refresh
            </Button>
          </Stack>
        </Paper>

        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchData}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Paper sx={{ height: 560 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            rowCount={total}
            loading={loading}
            paginationMode="server"
            sortingMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            disableRowSelectionOnClick
          />
        </Paper>

        <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
          <DialogTitle>Delete employee</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This will soft-delete the employee (set status to INACTIVE).
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              disabled={deleteLoading}
              onClick={async () => {
                if (!deleteId) return;
                setDeleteLoading(true);
                try {
                  await softDeleteEmployee(deleteId);
                  setDeleteId(null);
                  await fetchData();
                } catch (e: any) {
                  const message =
                    e?.response?.data?.message ||
                    e?.message ||
                    'Failed to delete employee';
                  setError(message);
                } finally {
                  setDeleteLoading(false);
                }
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  );
}
