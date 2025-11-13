import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Paper, Typography, Box, Button, 
  CircularProgress, Alert, Divider
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { getPaymentDetails, updatePaymentStatus, PAYMENT_STATUS } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';

const PaymentProcess = () => {
  const { paymentId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const processPaymentConfirmation = async () => {
      try {
        // Simulate payment gateway callback
        setLoading(true);
        
        // Get payment details
        const details = await getPaymentDetails(paymentId);
        if (!details) {
          setError('Payment not found');
          setLoading(false);
          return;
        }
        
        setPaymentDetails(details);
        
        // Simulate processing delay
        setTimeout(async () => {
          try {
            // Mock payment gateway response (90% success rate)
            const isSuccessful = Math.random() < 0.9;
            
            if (isSuccessful) {
              // Update payment status to completed
              await updatePaymentStatus(paymentId, PAYMENT_STATUS.COMPLETED);
              setSuccess(true);
            } else {
              // Update payment status to failed
              await updatePaymentStatus(paymentId, PAYMENT_STATUS.FAILED);
              setError('Payment could not be processed. Please try again.');
            }
            
            setProcessingComplete(true);
            setLoading(false);
          } catch (err) {
            console.error('Error updating payment status:', err);
            setError('An error occurred while confirming your payment');
            setLoading(false);
          }
        }, 3000); // 3 second delay to simulate processing
        
      } catch (err) {
        console.error('Error processing payment confirmation:', err);
        setError('Failed to process payment confirmation');
        setLoading(false);
      }
    };

    if (paymentId) {
      processPaymentConfirmation();
    }
  }, [paymentId]);

  // Redirect to orders page after successful payment
  useEffect(() => {
    if (success && processingComplete) {
      const timer = setTimeout(() => {
        navigate('/orders');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success, processingComplete, navigate]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        {loading ? (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Processing Your Payment
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we confirm your payment...
            </Typography>
          </>
        ) : error ? (
          <>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Payment Failed
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                onClick={() => navigate(`/payment/${paymentId}`)}
                sx={{ mr: 2 }}
              >
                Try Again
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/')}
              >
                Return to Home
              </Button>
            </Box>
          </>
        ) : (
          <>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Payment Successful!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Your payment of <strong>R{paymentDetails?.amount.toFixed(2)}</strong> has been processed successfully.
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              Your order has been confirmed and is being processed. You will be redirected to your orders page shortly.
            </Alert>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                onClick={() => navigate('/orders')}
              >
                View My Orders
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default PaymentProcess;