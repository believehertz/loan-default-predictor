import React, { useState } from 'react';
import { 
  Paper, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Avatar, Chip, Button, Box, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  MenuItem
} from '@mui/material';
import { AdminPanelSettings, Person, Add, Edit, Delete } from '@mui/icons-material';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

const Users: React.FC = () => {
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
    <Paper sx={{ p: 4, borderRadius: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">User Management</Typography>
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
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar><Person /></Avatar>
                    <Box>
                      <Typography fontWeight="bold">{user.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    color={user.role === 'Admin' ? 'error' : user.role === 'Manager' ? 'primary' : 'default'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.status} 
                    color={user.status === 'Active' ? 'success' : 'default'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{user.lastLogin}</TableCell>
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