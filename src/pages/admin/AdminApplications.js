import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Button, Chip, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const db = getFirestore();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const applicationsRef = collection(db, 'applications');
        const snapshot = await getDocs(applicationsRef);
        
        const applicationsList = [];
        for (const docRef of snapshot.docs) {
          const appData = docRef.data();
          
          // Get user info
          const userDoc = await getDoc(doc(db, 'users', appData.userId));
          const userData = userDoc.exists() ? userDoc.data() : { name: 'Unknown', email: 'Unknown' };
          
          applicationsList.push({
            id: docRef.id,
            ...appData,
            userName: userData.name,
            userEmail: userData.email
          });
        }
        
        setApplications(applicationsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching applications:", error);
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [db]);

  const handleViewDetails = (application) => {
    setSelectedApp(application);
    setDialogOpen(true);
    setFeedback(application.feedback || '');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedApp(null);
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, { 
        status: newStatus,
        feedback: feedback,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus, feedback: feedback } 
          : app
      ));
      
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const getStatusChip = (status) => {
    switch(status) {
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'approved':
        return <Chip label="Approved" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (loading) {
    return <Typography>Loading applications...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Manage Applications
      </Typography>
      
      {applications.length === 0 ? (
        <Typography>No applications found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <Typography variant="body2">{application.userName}</Typography>
                    <Typography variant="caption" color="textSecondary">{application.userEmail}</Typography>
                  </TableCell>
                  <TableCell>{application.type}</TableCell>
                  <TableCell>{new Date(application.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusChip(application.status)}</TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => handleViewDetails(application)}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {selectedApp && (
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedApp.type} Application - {selectedApp.userName}
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Application Details</Typography>
              
              {Object.entries(selectedApp.formData || {}).map(([key, value]) => (
                <Box key={key} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Typography>
                  <Typography variant="body2">{value}</Typography>
                </Box>
              ))}
              
              {selectedApp.documents && selectedApp.documents.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Documents</Typography>
                  {selectedApp.documents.map((doc, index) => (
                    <Box key={index}>
                      <Typography variant="body2">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          {doc.name}
                        </a>
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            
            <TextField
              label="Feedback"
              multiline
              rows={4}
              fullWidth
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            {selectedApp.status === 'pending' && (
              <>
                <Button 
                  onClick={() => handleStatusChange(selectedApp.id, 'rejected')}
                  color="error"
                >
                  Reject
                </Button>
                <Button 
                  onClick={() => handleStatusChange(selectedApp.id, 'approved')}
                  color="success"
                >
                  Approve
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AdminApplications;