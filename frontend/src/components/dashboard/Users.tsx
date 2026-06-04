import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Chip, Button, Box, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Person, Add, Edit, ArrowBack, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = (() => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${base.replace(/\/+$/, '')}/api`;
})();

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface CreateEmployeeForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Users: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { isAdmin, user: currentUser } = useAuth();
  const textColor = darkMode ? '#ffffff' : '#1e293b';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ── Edit role dialog ──
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('USER');
  const [updateLoading, setUpdateLoading] = useState(false);

  // ── Create employee dialog ──
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createEmployeeForm, setCreateEmployeeForm] = useState<CreateEmployeeForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // ── Delete dialog ──
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/auth/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err: any) {
      setError('Failed to load users: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // ── Edit Role ──
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewRole(user.role);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/auth/admin/users/${editingUser.id}/role?role=${newRole}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccess('Role updated successfully!');
      await fetchUsers();
      handleClose();
    } catch (err: any) {
      setError('Failed to update role: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUpdateLoading(false);
    }
  };

  // ── Create Employee ──
  const handleOpenCreateDialog = () => {
    setCreateError('');
    setCreateEmployeeForm({ username: '', email: '', password: '', confirmPassword: '' });
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setCreateEmployeeForm({ username: '', email: '', password: '', confirmPassword: '' });
  };

  const handleCreateEmployeeChange = (field: keyof CreateEmployeeForm, value: string) => {
    setCreateEmployeeForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateEmployee = async () => {
    if (!createEmployeeForm.username.trim()) { setCreateError('Username is required'); return; }
    if (!createEmployeeForm.email.trim()) { setCreateError('Email is required'); return; }
    if (!createEmployeeForm.password) { setCreateError('Password is required'); return; }
    if (createEmployeeForm.password !== createEmployeeForm.confirmPassword) {
      setCreateError('Passwords do not match'); return;
    }
    if (createEmployeeForm.password.length < 6) {
      setCreateError('Password must be at least 6 characters'); return;
    }

    try {
      setCreateLoading(true);
      setCreateError('');
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/auth/admin/employees`,
        {
          username: createEmployeeForm.username,
          email: createEmployeeForm.email,
          password: createEmployeeForm.password,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccess('Employee created successfully!');
      await fetchUsers();
      handleCloseCreateDialog();
    } catch (err: any) {
      setCreateError(err.response?.data?.detail || 'Failed to create employee');
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Delete User ──
  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
    setDeleteError('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setDeletingUser(null);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      setDeleteLoading(true);
      setDeleteError('');
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/users/${deletingUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccess(`User "${deletingUser.username}" was permanently deleted.`);
      handleDeleteClose();
      await fetchUsers();
    } catch (err: any) {
      // Backend returns a clear message when deletion is blocked (e.g. user has loans)
      setDeleteError(err.response?.data?.detail || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  // A user cannot delete themselves
  const canDelete = (user: User) => isAdmin && user.id !== (currentUser as any)?.id;

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Paper
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: darkMode ? '#1e293b' : '#ffffff',
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          color: textColor,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/dashboard')} sx={{ color: textColor }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" fontWeight="bold">Users & Roles</Typography>
          </Box>
          {isAdmin && (
            <Button variant="contained" color="success" startIcon={<Add />} onClick={handleOpenCreateDialog}>
              Create Employee
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: darkMode ? '#0f172a' : '#f8fafc' }}>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: textColor, fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: user.role === 'ADMIN' ? 'error.main' : 'primary.main' }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography fontWeight="bold" sx={{ color: textColor }}>{user.username}</Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={user.role === 'ADMIN' ? 'error' : user.role === 'EMPLOYEE' ? 'primary' : 'default'}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? 'Active' : 'Inactive'}
                        color={user.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => handleEditUser(user)}
                          disabled={!isAdmin}
                        >
                          Edit Role
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteClick(user)}
                          disabled={!canDelete(user)}
                          title={
                            !isAdmin
                              ? 'Admin only'
                              : user.id === (currentUser as any)?.id
                              ? 'Cannot delete your own account'
                              : `Delete ${user.username}`
                          }
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* ── Edit Role Dialog ── */}
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogContent>
            {editingUser && (
              <Box sx={{ pt: 1, pb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Updating role for <strong>{editingUser.username}</strong> ({editingUser.email})
                </Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Role</InputLabel>
                  <Select value={newRole} label="Role" onChange={(e) => setNewRole(e.target.value)}>
                    <MenuItem value="USER">USER</MenuItem>
                    <MenuItem value="EMPLOYEE">EMPLOYEE</MenuItem>
                    <MenuItem value="ADMIN">ADMIN</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button
              onClick={handleSaveRole}
              variant="contained"
              disabled={updateLoading || !editingUser || editingUser.role === newRole}
            >
              {updateLoading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Create Employee Dialog ── */}
        <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Employee</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, pb: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {createError && <Alert severity="error">{createError}</Alert>}
              <TextField
                label="Username" fullWidth value={createEmployeeForm.username}
                onChange={(e) => handleCreateEmployeeChange('username', e.target.value)}
                placeholder="Enter username" disabled={createLoading}
              />
              <TextField
                label="Email" fullWidth type="email" value={createEmployeeForm.email}
                onChange={(e) => handleCreateEmployeeChange('email', e.target.value)}
                placeholder="Enter email address" disabled={createLoading}
              />
              <TextField
                label="Password" fullWidth type="password" value={createEmployeeForm.password}
                onChange={(e) => handleCreateEmployeeChange('password', e.target.value)}
                placeholder="Minimum 6 characters" disabled={createLoading}
              />
              <TextField
                label="Confirm Password" fullWidth type="password" value={createEmployeeForm.confirmPassword}
                onChange={(e) => handleCreateEmployeeChange('confirmPassword', e.target.value)}
                placeholder="Confirm password" disabled={createLoading}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                This employee will be created with the EMPLOYEE role and can view loan predictions.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateDialog} color="inherit" disabled={createLoading}>Cancel</Button>
            <Button onClick={handleCreateEmployee} variant="contained" disabled={createLoading}>
              {createLoading ? <CircularProgress size={24} /> : 'Create Employee'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Delete Confirmation Dialog ── */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteClose} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ color: 'error.main' }}>Delete User</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              {deleteError ? (
                // Show backend's blocked-deletion message (e.g. "has loan records")
                <Alert severity="warning" sx={{ mb: 2 }}>{deleteError}</Alert>
              ) : (
                <Alert severity="error" sx={{ mb: 2 }}>
                  This action is <strong>permanent</strong> and cannot be undone.
                </Alert>
              )}
              {deletingUser && !deleteError && (
                <Typography variant="body2">
                  Are you sure you want to permanently delete{' '}
                  <strong>{deletingUser.username}</strong> ({deletingUser.email})?
                </Typography>
              )}
              {deletingUser && deleteError && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  To remove access for <strong>{deletingUser.username}</strong> without deleting,
                  use <em>Edit Role</em> or the deactivate option in the System Dashboard.
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteClose} color="inherit">
              {deleteError ? 'Close' : 'Cancel'}
            </Button>
            {/* Hide confirm button once backend has blocked the delete */}
            {!deleteError && (
              <Button
                onClick={handleConfirmDelete}
                variant="contained"
                color="error"
                disabled={deleteLoading}
              >
                {deleteLoading ? <CircularProgress size={24} /> : 'Yes, Delete'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Users;
