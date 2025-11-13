import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, TextField, Button, 
  Grid, Divider, Box, Alert, Tabs, Tab, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Profile = () => {
  const { 
    currentUser, 
    updateUserProfile, 
    updateUserEmail, 
    updateUserPassword,
    logout
  } = useAuth();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    displayName: '',
    phoneNumber: '',
    address: ''
  });
  
  // Email form state
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Delete account dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // Load user data
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        displayName: currentUser.displayName || '',
        phoneNumber: currentUser.phoneNumber || '',
        address: currentUser.address || ''
      });
      
      setEmailData({
        newEmail: currentUser.email || '',
        password: ''
      });
    }
  }, [currentUser]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSuccess('');
    setError('');
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailData({
      ...emailData,
      [name]: value
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    
    try {
      await updateUserProfile(profileData);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (emailData.newEmail === currentUser.email) {
      setError('New email is the same as current email');
      return;
    }
    
    if (!emailData.password) {
      setError('Password is required to update email');
      return;
    }
    
    setLoading(true);
    setSuccess('');
    setError('');
    
    try {
      await updateUserEmail(emailData.newEmail, emailData.password);
      setSuccess('Email updated successfully');
      setEmailData({
        ...emailData,
        password: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setSuccess('');
    setError('');
    
    try {
      await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    // This would be implemented with Firebase Auth deleteUser
    // For now, just log out the user
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };
  
  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading user profile...
        </Typography>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="profile tabs"
            variant="fullWidth"
          >
            <Tab label="Profile" />
            <Tab label="Email" />
            <Tab label="Password" />
            <Tab label="Account" />
          </Tabs>
        </Box>
        
        {success && (
          <Alert severity="success" sx={{ m: 2 }}>
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Edit Profile
          </Typography>
          
          <form onSubmit={handleProfileSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Display Name"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleProfileChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleProfileChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  multiline
                  rows={3}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
        
        {/* Email Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Change Email
          </Typography>
          
          <form onSubmit={handleEmailSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Email"
                  value={currentUser.email}
                  disabled
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Email"
                  name="newEmail"
                  type="email"
                  value={emailData.newEmail}
                  onChange={handleEmailChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={emailData.password}
                  onChange={handleEmailChange}
                  required
                  helperText="Enter your current password to confirm"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Email'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
        
        {/* Password Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          
          <form onSubmit={handlePasswordSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  helperText="Password must be at least 6 characters"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Password'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
        
        {/* Account Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Account Management
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Account Type:</strong> {currentUser.role || 'User'}
            </Typography>
            
            <Typography variant="body1" gutterBottom>
              <strong>Member Since:</strong> {new Date(currentUser.createdAt || Date.now()).toLocaleDateString()}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" color="error" gutterBottom>
              Danger Zone
            </Typography>
            
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Account
            </Button>
          </Box>
        </TabPanel>
      </Paper>
      
      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. All your data will be permanently deleted.
            To confirm, please type "DELETE" below.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error"
            disabled={deleteConfirmText !== 'DELETE'}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;