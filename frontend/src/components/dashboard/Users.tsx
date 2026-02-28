import React from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Chip, Button, Box } from '@mui/material';
import { AdminPanelSettings, Person } from '@mui/icons-material';

const Users: React.FC = () => {
  const users = [
    { id: 1, name: 'Admin User', email: 'admin@loanpredictor.com', role: 'Admin', status: 'Active', lastLogin: '2024-02-19' },
    { id: 2, name: 'John Analyst', email: 'john@company.com', role: 'Analyst', status: 'Active', lastLogin: '2024-02-18' },
    { id: 3, name: 'Sarah Manager', email: 'sarah@company.com', role: 'Manager', status: 'Active', lastLogin: '2024-02-17' },
  ];

  return (
    <Paper sx={{ p: 4, borderRadius: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">User Management</Typography>
        <Button variant="contained" startIcon={<AdminPanelSettings />}>Add User</Button>
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
                <TableCell><Chip label={user.role} color="primary" size="small" /></TableCell>
                <TableCell><Chip label={user.status} color="success" size="small" /></TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Users;