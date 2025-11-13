import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';

const Settings = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    emailNotifications: false,
    email: '',
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    const newValue = event.target.type === 'checkbox' ? checked : value;
    
    setSettings({
      ...settings,
      [name]: newValue,
    });
  };

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('settings', JSON.stringify(settings));
    
    setSnackbar({
      open: true,
      message: 'Settings saved successfully!',
      severity: 'success',
    });
  };

  const handleExportData = () => {
    // Get data from localStorage
    const applications = localStorage.getItem('applications') || '[]';
    const resumes = localStorage.getItem('resumes') || '[]';
    
    // Combine data
    const exportData = {
      applications: JSON.parse(applications),
      resumes: JSON.parse(resumes),
      exportDate: new Date().toISOString(),
    };
    
    // Create a download link
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'apply-assist-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setSnackbar({
      open: true,
      message: 'Data exported successfully!',
      severity: 'success',
    });
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('applications');
      localStorage.removeItem('resumes');
      
      setSnackbar({
        open: true,
        message: 'All data has been cleared.',
        severity: 'info',
      });
      
      // Force reload to update the UI
      window.location.reload();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Appearance
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.darkMode}
                onChange={handleChange}
                name="darkMode"
                color="primary"
              />
            }
            label="Dark Mode"
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Toggle between light and dark theme
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications}
                onChange={handleChange}
                name="notifications"
                color="primary"
              />
            }
            label="Browser Notifications"
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
            Receive notifications for application deadlines and follow-ups
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={handleChange}
                name="emailNotifications"
                color="primary"
              />
            }
            label="Email Notifications"
          />
          
          {settings.emailNotifications && (
            <TextField
              margin="normal"
              fullWidth
              label="Email Address"
              name="email"
              value={settings.email}
              onChange={handleChange}
              variant="outlined"
              type="email"
              sx={{ mt: 2 }}
            />
          )}
          
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
            >
              Save Settings
            </Button>
          </Box>
        </Paper>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Data Management
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleExportData}
            >
              Export Data
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearData}
            >
              Clear All Data
            </Button>
          </Box>
          
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Export your data as a JSON file or clear all stored data from the application.
          </Typography>
        </Paper>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;