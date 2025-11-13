import React, { useCallback, useMemo } from 'react';
import { Typography, TextField, Grid, Box, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import ServiceRequestForm from '../components/ServiceRequestForm';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

// Step 1: Personal Info
const PersonalInfoStep = React.memo(({ formData, onChange }) => {
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  }, [onChange]);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Personal Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth required label="First Name" name="firstName" value={formData.firstName || ''} onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth required label="Last Name" name="lastName" value={formData.lastName || ''} onChange={handleChange} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth required label="Email" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Phone Number" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} />
        </Grid>
      </Grid>
    </>
  );
});

// Step 2: Letter Details
const LetterDetailsStep = React.memo(({ formData, onChange }) => {
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  }, [onChange]);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Letter Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField fullWidth required label="Purpose of the Letter" name="purpose" value={formData.purpose || ''} onChange={handleChange} helperText="e.g., University application, bursary, job application" />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth required label="Target Organization/Institution" name="target" value={formData.target || ''} onChange={handleChange} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Program/Position" name="programOrPosition" value={formData.programOrPosition || ''} onChange={handleChange} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Key Achievements to Highlight" name="achievements" multiline rows={3} value={formData.achievements || ''} onChange={handleChange} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Additional Context" name="additionalContext" multiline rows={3} value={formData.additionalContext || ''} onChange={handleChange} helperText="Share any background or goals to tailor the letter" />
        </Grid>
      </Grid>
    </>
  );
});

// Step 3: Additional Info
const AdditionalInfoStep = React.memo(({ formData, onChange }) => {
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  }, [onChange]);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Additional Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField fullWidth label="Special Requirements" name="specialRequirements" multiline rows={3} value={formData.specialRequirements || ''} onChange={handleChange} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Notes for the Writer" name="notes" multiline rows={3} value={formData.notes || ''} onChange={handleChange} />
        </Grid>
      </Grid>
      <Box sx={{ mt: 3 }}>
        <Divider />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          We'll confirm details and timeline after submission. Your letter will be tailored to your background and goals.
        </Typography>
      </Box>
    </>
  );
});

const MotivationalLetterForm = () => {
  const { currentUser } = useAuth();

  const steps = useMemo(() => [
    'Personal Information',
    'Letter Details',
    'Additional Information'
  ], []);

  const stepComponents = useMemo(() => [
    PersonalInfoStep,
    LetterDetailsStep,
    AdditionalInfoStep
  ], []);

  const initialData = useMemo(() => ({
    firstName: currentUser?.displayName?.split(' ')[0] || '',
    lastName: currentUser?.displayName?.split(' ').slice(1).join(' ') || '',
    email: currentUser?.email || '',
    phoneNumber: currentUser?.phoneNumber || ''
  }), [currentUser]);

  // Use local storage fallback in development/offline mode similar to BursaryApplicationForm
  const { useLocalStorage, localDb } = require('../firebase/config');

  const handleSubmit = useCallback(async (formData) => {
    try {
      if (useLocalStorage) {
        const res = localDb.collection('serviceRequests').add({ ...formData, serviceType: 'motivational_letter' });
        return res.id;
      }
      const docRef = await addDoc(collection(db, 'serviceRequests'), { ...formData, serviceType: 'motivational_letter' });
      return docRef.id;
    } catch (error) {
      console.error('Error submitting motivational letter request:', error);
      throw new Error('Failed to submit motivational letter request. Please try again.');
    }
  }, []);

  return (
    <ServiceRequestForm
      title="Motivational Letter Request"
      steps={steps}
      stepComponents={stepComponents}
      initialData={initialData}
      onSubmit={handleSubmit}
      serviceType="motivational_letter"
    />
  );
};

export default MotivationalLetterForm;