import React, { useState } from 'react';
import { TextField, Button, Box, Paper, Typography, Grid } from '@mui/material';

const AddMachineForm = ({ onAddMachine, onCancel }) => {
  const [formData, setFormData] = useState({
    machineNumber: '',
    machineName: '',
    capacity: '',
    location: '',
    status: 'Active'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.machineNumber && formData.machineName) {
      onAddMachine({
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });
      setFormData({
        machineNumber: '',
        machineName: '',
        capacity: '',
        location: '',
        status: 'Active'
      });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add New Machine
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Machine Number"
              name="machineNumber"
              value={formData.machineNumber}
              onChange={handleChange}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Machine Name"
              name="machineName"
              value={formData.machineName}
              onChange={handleChange}
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
          >
            Add Machine
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AddMachineForm;
