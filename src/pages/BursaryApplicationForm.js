import React from 'react';
import { Typography, TextField, Grid, FormControlLabel, Checkbox } from '@mui/material';
import ServiceRequestForm from '../components/ServiceRequestForm';
import { addDoc, collection } from 'firebase/firestore';
import { db, useLocalStorage, localDb } from '../firebase/config';

const ApplicantInfoStep = ({ formData, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Applicant Information
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
          <TextField fullWidth required label="Phone Number" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} />
        </Grid>
      </Grid>
    </>
  );
};

const AcademicInfoStep = ({ formData, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Academic Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField fullWidth required label="Institution" name="institution" value={formData.institution || ''} onChange={handleChange} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth required label="Program" name="program" value={formData.program || ''} onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth required label="Academic Year" name="academicYear" type="number" value={formData.academicYear || ''} onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Average Grade/Percentage" name="averageGrade" value={formData.averageGrade || ''} onChange={handleChange} />
        </Grid>
      </Grid>
    </>
  );
};

const FinancialInfoStep = ({ formData, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    onChange({ [name]: checked });
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Financial Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField fullWidth required label="Household Income" name="householdIncome" value={formData.householdIncome || ''} onChange={handleChange} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Funding Motivation" name="motivation" multiline rows={3} value={formData.motivation || ''} onChange={handleChange} />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel control={<Checkbox checked={formData.agreeToTerms || false} onChange={handleCheckbox} name="agreeToTerms" />} label="I confirm the information provided is accurate" />
        </Grid>
      </Grid>
    </>
  );
};

const BursaryApplicationForm = () => {
  const steps = ['Applicant Information', 'Academic Information', 'Financial Information'];
  const stepComponents = [ApplicantInfoStep, AcademicInfoStep, FinancialInfoStep];

  const initialData = { agreeToTerms: false };

  const handleSubmit = async (formData) => {
    try {
      if (useLocalStorage) {
        const res = localDb.collection('serviceRequests').add({ ...formData, serviceType: 'bursary_application' });
        return res.id;
      }
      const docRef = await addDoc(collection(db, 'serviceRequests'), { ...formData, serviceType: 'bursary_application' });
      return docRef.id;
    } catch (error) {
      console.error('Error submitting bursary application request:', error);
      throw new Error('Failed to submit bursary application. Please try again.');
    }
  };

  return (
    <ServiceRequestForm
      title="Bursary Application Form"
      steps={steps}
      stepComponents={stepComponents}
      initialData={initialData}
      onSubmit={handleSubmit}
      serviceType="bursary_application"
    />
  );
};

export default BursaryApplicationForm;