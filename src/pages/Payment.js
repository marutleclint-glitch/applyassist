import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, Paper, Typography, TextField, Button, 
  Stepper, Step, StepLabel, Box, Grid, Divider,
  Radio, RadioGroup, FormControlLabel, FormControl,
  FormLabel, Alert, CircularProgress, Snackbar
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getPaymentDetails, processPayment, generateEFTInstructions, getServiceNameById } from '../services/paymentService';

const Payment = () => {
  const { paymentId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submissionToastOpen, setSubmissionToastOpen] = useState(false);
  
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [eftInstructions, setEftInstructions] = useState(null);
  
  // Form state for card payment
  const [cardDetails, setCardDetails] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  // Load payment details
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const details = await getPaymentDetails(paymentId);
        if (!details) {
          setError('Payment not found');
          setLoading(false);
          return;
        }
        setPaymentDetails(details);
        
        // Generate EFT instructions
        const eft = await generateEFTInstructions({
          id: paymentId,
          amount: details.amount
        });
        setEftInstructions(eft);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching payment details:', err);
        setError('Failed to load payment details');
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId]);

  useEffect(() => {
    if (location.state?.fromSubmission) {
      setSubmissionToastOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setCardDetails({ ...cardDetails, [name]: formatted });
      return;
    }
    
    // Format expiry date
    if (name === 'expiryDate') {
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      
      if (cleaned.length > 2) {
        formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
      }
      
      setCardDetails({ ...cardDetails, [name]: formatted });
      return;
    }
    
    setCardDetails({ ...cardDetails, [name]: value });
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateCardDetails = () => {
    if (!cardDetails.cardholderName.trim()) {
      setError('Cardholder name is required');
      return false;
    }
    
    const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
    if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
      setError('Please enter a valid 16-digit card number');
      return false;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      setError('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    
    if (!/^\d{3}$/.test(cardDetails.cvv)) {
      setError('Please enter a valid 3-digit CVV');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmitPayment = async () => {
    if (paymentMethod === 'card' && !validateCardDetails()) {
      return;
    }
    
    setProcessing(true);
    setError('');
    
    try {
      if (paymentMethod === 'card') {
        const result = await processPayment(paymentId, cardDetails);
        
        if (result.success) {
          setSuccess(true);
          // Navigate to order confirmation after a delay
          setTimeout(() => {
            navigate('/orders');
          }, 3000);
        } else {
          setError(result.message || 'Payment failed');
        }
      } else {
        // For EFT, just mark as success and show instructions
        setSuccess(true);
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('An error occurred while processing your payment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading payment details...
        </Typography>
      </Container>
    );
  }

  if (error && !paymentDetails) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/')}
        >
          Return to Home
        </Button>
      </Container>
    );
  }

  const steps = ['Select Payment Method', 'Enter Payment Details', 'Confirm Payment'];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Complete Your Payment
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {paymentMethod === 'card' 
              ? 'Payment processed successfully! Redirecting to your orders...' 
              : 'EFT instructions have been provided. Your order will be processed once payment is confirmed.'}
          </Alert>
        )}
        
        <Box sx={{ mt: 2 }}>
          {activeStep === 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Service:</strong> {getServiceNameById(paymentDetails?.serviceType)}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Reference:</strong> {paymentId.substring(0, 8)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" align="right">
                    Total: R{paymentDetails?.amount.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ mb: 3 }} />
              
              <FormControl component="fieldset">
                <FormLabel component="legend">Select Payment Method</FormLabel>
                <RadioGroup
                  name="paymentMethod"
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                >
                  <FormControlLabel 
                    value="card" 
                    control={<Radio />} 
                    label="Credit/Debit Card (Mock PayFast)" 
                  />
                  <FormControlLabel 
                    value="eft" 
                    control={<Radio />} 
                    label="Electronic Funds Transfer (EFT)" 
                  />
                </RadioGroup>
              </FormControl>
            </>
          )}
          
          {activeStep === 1 && (
            <>
              {paymentMethod === 'card' ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    Card Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Cardholder Name"
                        name="cardholderName"
                        value={cardDetails.cardholderName}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Card Number"
                        name="cardNumber"
                        value={cardDetails.cardNumber}
                        onChange={handleInputChange}
                        inputProps={{ maxLength: 19 }}
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Expiry Date"
                        name="expiryDate"
                        value={cardDetails.expiryDate}
                        onChange={handleInputChange}
                        inputProps={{ maxLength: 5 }}
                        placeholder="MM/YY"
                        required
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="CVV"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleInputChange}
                        inputProps={{ maxLength: 3 }}
                        required
                      />
                    </Grid>
                  </Grid>
                </>
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>
                    EFT Payment Instructions
                  </Typography>
                  
                  <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f9f9f9' }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Bank:</strong> {eftInstructions?.bankName}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Account Holder:</strong> {eftInstructions?.accountHolder}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Account Number:</strong> {eftInstructions?.accountNumber}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Branch Code:</strong> {eftInstructions?.branchCode}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Reference:</strong> {eftInstructions?.reference}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Amount:</strong> R{eftInstructions?.amount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                      {eftInstructions?.instructions}
                    </Typography>
                  </Paper>
                  
                  <Alert severity="info">
                    After making the payment, please upload proof of payment in the next step.
                  </Alert>
                </>
              )}
            </>
          )}
          
          {activeStep === 2 && (
            <>
              <Typography variant="h6" gutterBottom>
                Payment Confirmation
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f9f9f9' }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Service:</strong> {getServiceNameById(paymentDetails?.serviceType)}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Amount:</strong> R{paymentDetails?.amount.toFixed(2)}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Payment Method:</strong> {paymentMethod === 'card' ? 'Credit/Debit Card' : 'EFT'}
                </Typography>
                
                {paymentMethod === 'card' && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Card Number:</strong> **** **** **** {cardDetails.cardNumber.slice(-4)}
                  </Typography>
                )}
              </Paper>
              
              {paymentMethod === 'eft' && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Your order will be processed once your payment has been confirmed. This may take 1-2 business days.
                </Alert>
              )}
            </>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || processing}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            color={activeStep === steps.length - 1 ? "success" : "primary"}
            onClick={activeStep === steps.length - 1 ? handleSubmitPayment : handleNext}
            disabled={processing || success}
          >
            {processing ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Processing...
              </>
            ) : activeStep === steps.length - 1 ? (
              'Complete Payment'
            ) : (
              'Next'
            )}
          </Button>
        </Box>
        <Snackbar
          open={submissionToastOpen}
          autoHideDuration={4000}
          onClose={() => setSubmissionToastOpen(false)}
        >
          <Alert onClose={() => setSubmissionToastOpen(false)} severity="success" sx={{ width: '100%' }}>
            Order created successfully. Please complete payment.
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default Payment;