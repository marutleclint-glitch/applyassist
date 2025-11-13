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
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { ApplicationContext } from '../context/ApplicationContext';

const Resumes = () => {
  const { resumes, addResume, updateResume, deleteResume } = useContext(ApplicationContext);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentResume, setCurrentResume] = useState({
    name: '',
    description: '',
    content: '',
    tags: '',
  });

  const handleOpenDialog = (resume = null) => {
    if (resume) {
      setCurrentResume(resume);
      setIsEditing(true);
    } else {
      setCurrentResume({
        name: '',
        description: '',
        content: '',
        tags: '',
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
    setCurrentResume({
      ...currentResume,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    // Process tags into an array
    const processedResume = {
      ...currentResume,
      tags: currentResume.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };
    
    if (isEditing) {
      updateResume(currentResume.id, processedResume);
    } else {
      addResume(processedResume);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      deleteResume(id);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Resume Versions
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Resume
          </Button>
        </Box>

        {resumes.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              No resumes yet. Add different versions of your resume to track which one you use for each application!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {resumes.map((resume) => (
              <Grid item xs={12} sm={6} md={4} key={resume.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DescriptionIcon sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        {resume.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {resume.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {resume.tags && resume.tags.map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Added: {new Date(resume.dateAdded).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(resume)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(resume.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Add/Edit Resume Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {isEditing ? 'Edit Resume' : 'Add New Resume'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 1 }}>
              <TextField
                margin="dense"
                name="name"
                label="Resume Name"
                fullWidth
                variant="outlined"
                value={currentResume.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Software Developer Resume, Frontend Focused Resume"
              />
              <TextField
                margin="dense"
                name="description"
                label="Description"
                fullWidth
                variant="outlined"
                value={currentResume.description}
                onChange={handleInputChange}
                placeholder="Brief description of this resume version"
              />
              <TextField
                margin="dense"
                name="tags"
                label="Tags (comma separated)"
                fullWidth
                variant="outlined"
                value={currentResume.tags}
                onChange={handleInputChange}
                placeholder="e.g., frontend, react, junior"
              />
              <TextField
                margin="dense"
                name="content"
                label="Resume Content"
                fullWidth
                variant="outlined"
                multiline
                rows={10}
                value={currentResume.content}
                onChange={handleInputChange}
                placeholder="Paste your resume content here or add notes about this version"
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

export default Resumes;