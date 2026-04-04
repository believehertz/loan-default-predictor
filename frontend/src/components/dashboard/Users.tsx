import React, { useState } from 'react';
import { 
  Paper, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Avatar, Chip, Button, Box, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, IconButton
} from '@mui/material';
import { Person, Add, Edit, Delete, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

const Users: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const textColor = darkMode ? '#ffffff' : '#1a1a2e';
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Admin User', email: 'admin@loanpredictor.com', role: 'Admin', status: 'Active', lastLogin: '2024-02-19' },
    { id: 2, name: 'John Analyst', email: 'john@company.com', role: 'Analyst', status: 'Active', lastLogin: '2024-02-18' },
    { id: 3, name: 'Sarah Manager', email: 'sarah@company.com', role: 'Manager', status: 'Active', lastLogin: '2024-02-17' },
  ]);

  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Analyst',
    status: 'Active'
  });

  // Open dialog for adding new user
  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Analyst',
      status: 'Active'
    });
    setOpen(true);
  };

  // Open dialog for editing
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setOpen(true);
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
  };

  const handleSave = () => {
    if (editingUser) {
      // Update existing user
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData }
          : u
      ));
    } else {
      // Add new user
      const newUser: User = {
        id: Date.now(),
        ...formData,
        lastLogin: 'Never'
      };
      setUsers([...users, newUser]);
    }
    handleClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 0, backdropFilter: 'blur(20px)', backgroundColor: darkMode ? 'rgba(26, 26, 46, 0.7)' : 'rgba(255, 255, 255, 0.95)', border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', color: textColor }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/dashboard')}
            sx={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(102, 126, 234, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.8)' } }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" sx={{ color: textColor, textShadow: darkMode ? '0 0 12px rgba(255, 255, 255, 0.3)' : 'none' }}>User Management</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: darkMode ? '#2d2d44' : '#f5f5f5' }}>
              <TableCell sx={{ color: textColor }}>User</TableCell>
              <TableCell sx={{ color: textColor }}>Role</TableCell>
              <TableCell sx={{ color: textColor }}>Status</TableCell>
              <TableCell sx={{ color: textColor }}>Last Login</TableCell>
              <TableCell sx={{ color: textColor }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar><Person /></Avatar>
                    <Box>
                      <Typography fontWeight="bold" sx={{ color: textColor }}>{user.name}</Typography>
                      <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }}>{user.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: textColor }}>
                  <Chip 
                    label={user.role} 
                    color={user.role === 'Admin' ? 'error' : user.role === 'Manager' ? 'primary' : 'default'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell sx={{ color: textColor }}>
                  <Chip 
                    label={user.status} 
                    color={user.status === 'Active' ? 'success' : 'default'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell sx={{ color: textColor }}>{user.lastLogin}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </Button>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Full Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            name="role"
            label="Role"
            fullWidth
            value={formData.role}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            SelectProps={{
              native: true
            }}
          >
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Analyst">Analyst</option>
            <option value="Viewer">Viewer</option>
          </TextField>
          <TextField
            select
            margin="dense"
            name="status"
            label="Status"
            fullWidth
            value={formData.status}
            onChange={handleInputChange}
            SelectProps={{
              native: true
            }}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!formData.name || !formData.email}
          >
            {editingUser ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Users;