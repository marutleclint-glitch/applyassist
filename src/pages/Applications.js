import React, { useState, useContext } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { ApplicationContext } from '../context/ApplicationContext';

const Applications = () => {
  const { applications, addApplication, updateApplication, deleteApplication } = useContext(ApplicationContext);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentApplication, setCurrentApplication] = useState({
    company: '',
    position: '',
    location: '',
    status: 'Applied',
    url: '',
    notes: '',
    resumeId: '',
  });

  const handleOpenDialog = (application = null) => {
    if (application) {
      setCurrentApplication(application);
      setIsEditing(true);
    } else {
      setCurrentApplication({
        company: '',
        position: '',
        location: '',
        status: 'Applied',
        url: '',
        notes: '',
        resumeId: '',
      });
      setIsEditing(false);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentApplication({
      ...currentApplication,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    if (isEditing) {
      updateApplication(currentApplication.id, currentApplication);
    } else {
      addApplication(currentApplication);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      deleteApplication(id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return 'primary';
      case 'Interview':
        return 'secondary';
      case 'Offer':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Job Applications
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Application
          </Button>
        </Box>

        {applications.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              No applications yet. Start tracking your job applications!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {applications.map((application) => (
              <Grid item xs={12} sm={6} md={4} key={application.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div" noWrap>
                      {application.company}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {application.position}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                      {application.location}
                    </Typography>
                    <Chip
                      label={application.status}
                      color={getStatusColor(application.status)}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Applied: {new Date(application.dateAdded).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(application)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(application.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Add/Edit Application Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {isEditing ? 'Edit Application' : 'Add New Application'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 1 }}>
              <TextField
                margin="dense"
                name="company"
                label="Company"
                fullWidth
                variant="outlined"
                value={currentApplication.company}
                onChange={handleInputChange}
                required
              />
              <TextField
                margin="dense"
                name="position"
                label="Position"
                fullWidth
                variant="outlined"
                value={currentApplication.position}
                onChange={handleInputChange}
                required
              />
              <TextField
                margin="dense"
                name="location"
                label="Location"
                fullWidth
                variant="outlined"
                value={currentApplication.location}
                onChange={handleInputChange}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={currentApplication.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="Applied">Applied</MenuItem>
                  <MenuItem value="Interview">Interview</MenuItem>
                  <MenuItem value="Offer">Offer</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Withdrawn">Withdrawn</MenuItem>
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                name="url"
                label="Job URL"
                fullWidth
                variant="outlined"
                value={currentApplication.url}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="notes"
                label="Notes"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={currentApplication.notes}
                onChange={handleInputChange}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {isEditing ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Applications;