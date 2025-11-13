import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Paper, Box, Grid, Chip, Button, 
  Divider, CircularProgress, Dialog, DialogActions, 
  DialogContent, DialogContentText, DialogTitle, Alert
} from '@mui/material';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { createOrderStatusNotification } from '../services/notificationService';
import { getServiceNameById } from '../services/paymentService';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderDoc = await getDoc(doc(db, 'serviceRequests', orderId));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() });
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, db]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const previousStatus = order.status;
      
      await updateDoc(doc(db, 'serviceRequests', orderId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Create notification for status update
      await createOrderStatusNotification(
        { ...order, id: orderId },
        previousStatus,
        newStatus
      );
      
      setOrder(prev => ({ ...prev, status: newStatus, updatedAt: new Date() }));
      setStatusUpdateSuccess(true);
      
      setTimeout(() => {
        setStatusUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    }
  };

  const handleDeleteOrder = async () => {
    try {
      await deleteDoc(doc(db, 'serviceRequests', orderId));
      setDeleteDialogOpen(false);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('Failed to delete order');
      setDeleteDialogOpen(false);
    }
  };

  const openChat = () => {
    navigate(`/chat?orderId=${orderId}`);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Order not found</Alert>
      </Container>
    );
  }

  const isAdmin = currentUser?.role === 'admin';
  const isOwner = currentUser?.uid === order.userId;
  const canView = isAdmin || isOwner;

  if (!canView) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">You don't have permission to view this order</Alert>
      </Container>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'PPpp');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {statusUpdateSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Order status updated successfully
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Order Details
          </Typography>
          <Chip 
            label={order.status || 'pending'} 
            color={getStatusColor(order.status || 'pending')} 
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Order ID</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{order.id}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Service Type</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{getServiceNameById(order.serviceType)}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Created On</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{formatDate(order.createdAt)}</Typography>
            
            {order.updatedAt && (
              <>
                <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{formatDate(order.updatedAt)}</Typography>
              </>
            )}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Client Name</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{order.userName || 'N/A'}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Email</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{order.userEmail || 'N/A'}</Typography>
            
            {order.paymentStatus && (
              <>
                <Typography variant="subtitle2" color="text.secondary">Payment Status</Typography>
                <Chip 
                  label={order.paymentStatus} 
                  color={order.paymentStatus === 'paid' ? 'success' : 'warning'} 
                  size="small"
                  sx={{ mb: 2 }}
                />
              </>
            )}
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" sx={{ mb: 2 }}>Order Information</Typography>
        
        {/* Dynamic order details based on service type */}
        <Grid container spacing={2}>
          {order.serviceType === 'cv_creation' && (
            <>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">CV Type</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{order.cvType || 'Standard'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Cover Letter</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{order.coverLetter ? 'Yes' : 'No'}</Typography>
              </Grid>
            </>
          )}
          
          {order.serviceType === 'university_application' && (
            <>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">University Choices</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {order.universityChoices?.map((uni, index) => (
                    <div key={index}>{index + 1}. {uni.name} - {uni.program}</div>
                  )) || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Funding Assistance</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{order.fundingAssistance ? 'Yes' : 'No'}</Typography>
              </Grid>
            </>
          )}
          
          {order.serviceType === 'bursary_application' && (
            <>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Bursary Choices</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {order.bursaryChoices?.map((bursary, index) => (
                    <div key={index}>{index + 1}. {bursary.name} - {bursary.provider}</div>
                  )) || 'N/A'}
                </Typography>
              </Grid>
            </>
          )}

          {order.serviceType === 'motivational_letter' && (
            <>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Purpose</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{order.purpose || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Target Organization</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{order.targetOrganization || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Tone Preference</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{order.tonePreference || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Key Achievements</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{order.keyAchievements || 'N/A'}</Typography>
              </Grid>
            </>
          )}
          
          {/* Additional notes */}
          {order.additionalInfo && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Additional Information</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{order.additionalInfo}</Typography>
            </Grid>
          )}
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Action buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={openChat}
              sx={{ mr: 2 }}
            >
              Open Chat
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/dashboard')}
            >
              Back
            </Button>
          </Box>
          
          {isAdmin && (
            <Box>
              {order.status !== 'in_progress' && (
                <Button 
                  variant="contained" 
                  color="info" 
                  onClick={() => handleStatusUpdate('in_progress')}
                  sx={{ mr: 2 }}
                >
                  Mark In Progress
                </Button>
              )}
              
              {order.status !== 'completed' && (
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => handleStatusUpdate('completed')}
                  sx={{ mr: 2 }}
                >
                  Mark Completed
                </Button>
              )}
              
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this order? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteOrder} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderDetails;