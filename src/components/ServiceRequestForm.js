import React, { useState } from 'react';
import { 
  Container, Paper, Typography, Stepper, Step, StepLabel, 
  Button, Box, CircularProgress, Alert, useMediaQuery, useTheme,
  MobileStepper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPayment, SERVICE_TYPES } from '../services/paymentService';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

const ServiceRequestForm = ({ 
  title, 
  steps, 
  stepComponents, 
  initialData, 
  onSubmit,
  serviceType 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialData || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFormChange = (data) => {
    setFormData(prevData => ({
      ...prevData,
      ...data
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Add metadata to the form data
      const submissionData = {
        ...formData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        serviceType,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Submit the form data
      const orderId = await onSubmit(submissionData);
      
      // Create payment record and navigate to payment page
      const svc = Object.values(SERVICE_TYPES).find(s => s.id === serviceType) || null;
      const amount = svc ? svc.price : 0;
      const payment = await createPayment({
        orderId,
        userId: currentUser.uid,
        amount,
        serviceType: svc ? svc.id : serviceType
      });
      
      navigate(`/payment/${payment.id}`, { state: { fromSubmission: true } });
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Failed to submit form. Please try again.');
      setLoading(false);
    }
  };

  // Get the current step component
  const CurrentStepComponent = stepComponents[activeStep];

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 4, sm: 8 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          {title}
        </Typography>
        
        {!isMobile ? (
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, mt: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        ) : (
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body1" align="center" sx={{ mb: 1 }}>
              Step {activeStep + 1} of {steps.length}: {steps[activeStep]}
            </Typography>
            <MobileStepper
              variant="dots"
              steps={steps.length}
              position="static"
              activeStep={activeStep}
              sx={{ flexGrow: 1, bgcolor: 'background.paper' }}
              nextButton={
                <Button 
                  size="small" 
                  onClick={handleNext} 
                  disabled={activeStep === steps.length - 1}
                >
                  Next
                  <KeyboardArrowRight />
                </Button>
              }
              backButton={
                <Button 
                  size="small" 
                  onClick={handleBack} 
                  disabled={activeStep === 0}
                >
                  <KeyboardArrowLeft />
                  Back
                </Button>
              }
            />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mt: 2, mb: 2 }}>
          {activeStep === steps.length ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                All steps completed
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSubmit}
                disabled={loading}
                sx={{ mt: 2 }}
                fullWidth={isMobile}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Application'}
              </Button>
            </Box>
          ) : (
            <>
              <CurrentStepComponent 
                formData={formData} 
                onChange={handleFormChange} 
              />
              
              {!isMobile ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    variant="outlined"
                    disabled={activeStep === 0}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                  >
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ mt: 4 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                  {activeStep !== 0 && (
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      fullWidth
                    >
                      Back
                    </Button>
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ServiceRequestForm;