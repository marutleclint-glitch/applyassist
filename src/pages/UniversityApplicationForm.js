import React from 'react';
import { 
  Typography, TextField, Grid, FormControl, 
  InputLabel, Select, MenuItem, FormHelperText,
  Box, Divider, FormControlLabel, Checkbox,
  Radio, RadioGroup, ListItemText
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import ServiceRequestForm from '../components/ServiceRequestForm';
import { addDoc, collection } from 'firebase/firestore';
import { db, useLocalStorage, localDb } from '../firebase/config';
import { UNIVERSITIES, isOpen } from '../services/universitiesService';

// Personal Information Step
const PersonalInfoStep = ({ formData, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Personal Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="First Name"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Last Name"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="ID Number"
            name="idNumber"
            value={formData.idNumber || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.dateOfBirth || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Address"
            name="address"
            multiline
            rows={2}
            value={formData.address || ''}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </>
  );
};

// Education Background Step
const EducationStep = ({ formData, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Education Background
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Highest Level of Education</InputLabel>
            <Select
              name="highestEducation"
              value={formData.highestEducation || ''}
              onChange={handleChange}
              label="Highest Level of Education"
            >
              <MenuItem value="high_school">High School</MenuItem>
              <MenuItem value="certificate">Certificate</MenuItem>
              <MenuItem value="diploma">Diploma</MenuItem>
              <MenuItem value="bachelors">Bachelor's Degree</MenuItem>
              <MenuItem value="honours">Honours Degree</MenuItem>
              <MenuItem value="masters">Master's Degree</MenuItem>
              <MenuItem value="doctorate">Doctorate</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="School/Institution Name"
            name="schoolName"
            value={formData.schoolName || ''}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Year Completed"
            name="yearCompleted"
            type="number"
            value={formData.yearCompleted || ''}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Matric/High School Results
          </Typography>
        </Grid>
        
        {['Mathematics', 'English', 'Physical Science', 'Life Science', 'Geography', 'History'].map((subject) => (
          <Grid item xs={12} sm={6} key={subject}>
            <TextField
              fullWidth
              label={`${subject} Grade/Mark`}
              name={`matric_${subject.toLowerCase().replace(' ', '_')}`}
              value={formData[`matric_${subject.toLowerCase().replace(' ', '_')}`] || ''}
              onChange={handleChange}
              helperText="Enter percentage or symbol (e.g., 75% or B)"
            />
          </Grid>
        ))}
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Other Subjects and Grades"
            name="otherSubjects"
            multiline
            rows={3}
            value={formData.otherSubjects || ''}
            onChange={handleChange}
            helperText="List other subjects and grades in format: Subject - Grade"
          />
        </Grid>
      </Grid>
    </>
  );
};

// University Preferences Step
const UniversityStep = ({ formData, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleUniversityChange = (index, field, value) => {
    const updatedUniversities = [...(formData.universities || [{}])];
    if (!updatedUniversities[index]) {
      updatedUniversities[index] = {};
    }
    updatedUniversities[index][field] = value;
    onChange({ universities: updatedUniversities });
  };

  const allUniversities = UNIVERSITIES;
  const universities = formData.universities || [{}];

  return (
    <>
      <Typography variant="h6" gutterBottom>
        University Preferences
      </Typography>
      
      {/* Multi-select control for universities */}
      <Grid container spacing={3} sx={{ mb: 1 }}>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Universities</InputLabel>
            <Select
              multiple
              value={(formData.universities || []).map(u => u.id).filter(Boolean)}
              onChange={(e) => {
                const selectedIds = e.target.value;
                const existing = formData.universities || [];
                const newUniversities = selectedIds.map(id => {
                  const existingObj = existing.find(u => u.id === id) || {};
                  const info = allUniversities.find(u => u.id === id) || {};
                  return {
                    id,
                    name: info.name,
                    closingDate: info.closingDate,
                    program: existingObj.program || '',
                    level: existingObj.level || '',
                    year: existingObj.year || ''
                  };
                });
                onChange({ universities: newUniversities });
              }}
              label="Universities"
              renderValue={(selected) => selected.map(id => (allUniversities.find(u => u.id === id)?.name || id)).join(', ')}
            >
              {allUniversities.map(u => (
                <MenuItem key={u.id} value={u.id}>
                  <Checkbox checked={(formData.universities || []).map(x => x.id).includes(u.id)} />
                  <ListItemText primary={u.name} secondary={`Closes: ${new Date(u.closingDate).toLocaleDateString()} • ${isOpen(u.closingDate) ? 'Open' : 'Closed'}`} />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Select multiple universities. Closing dates and status shown below for each selection.
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
      {universities.map((uni, index) => (
        <Box key={index} sx={{ mb: 4 }}>
          {index > 0 && <Divider sx={{ my: 2 }} />}
          
          <Typography variant="subtitle1" gutterBottom>
            University Choice #{index + 1}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>University</InputLabel>
                <Select
                  value={uni.id || ''}
                  onChange={(e) => {
                    const selected = allUniversities.find(u => u.id === e.target.value);
                    handleUniversityChange(index, 'id', selected?.id || '');
                    handleUniversityChange(index, 'name', selected?.name || '');
                    handleUniversityChange(index, 'closingDate', selected?.closingDate || '');
                  }}
                  label="University"
                >
                  {allUniversities.map(u => (
                    <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                  ))}
                </Select>
                <TextField
                  label="University"
                  value={uni.name || ''}
                  disabled
                />
                 <FormHelperText>
                  Closing date is {uni.closingDate || 'N/A'}. Status: {uni.closingDate ? (isOpen(uni.closingDate) ? 'Open' : 'Closed') : 'Unknown'}.
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Program/Course"
                value={uni.program || ''}
                onChange={(e) => handleUniversityChange(index, 'program', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Study Level</InputLabel>
                <Select
                  value={uni.level || ''}
                  onChange={(e) => handleUniversityChange(index, 'level', e.target.value)}
                  label="Study Level"
                >
                  <MenuItem value="undergraduate">Undergraduate</MenuItem>
                  <MenuItem value="honours">Honours</MenuItem>
                  <MenuItem value="postgraduate_diploma">Postgraduate Diploma</MenuItem>
                  <MenuItem value="masters">Masters</MenuItem>
                  <MenuItem value="doctorate">Doctorate</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Academic Year"
                type="number"
                value={uni.year || ''}
                onChange={(e) => handleUniversityChange(index, 'year', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      ))}
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Typography
          variant="body2"
          color="primary"
          sx={{ cursor: 'pointer' }}
          onClick={() => onChange({ universities: [...universities, {}] })}
        >
          + Add Another University
        </Typography>
      </Box>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Application Deadline (optional)
        </Typography>
        <TextField
          fullWidth
          label="Application Deadline"
          name="applicationDeadline"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={formData.applicationDeadline || ''}
          onChange={handleChange}
          helperText="We’ll also track official closing dates for selected universities."
        />
      </Box>
    </>
  );
};

// Supporting Documents Step
const DocumentsStep = ({ formData, onChange }) => {
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    onChange({ [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Supporting Documents
      </Typography>
      
      <Typography variant="body1" paragraph>
        Please indicate which documents you have available for your application. 
        Our team will contact you to arrange secure document submission after your request is processed.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasIdDocument || false}
                onChange={handleChange}
                name="hasIdDocument"
              />
            }
            label="ID Document/Passport"
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasMatricCertificate || false}
                onChange={handleChange}
                name="hasMatricCertificate"
              />
            }
            label="Matric Certificate/Statement of Results"
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasAcademicTranscripts || false}
                onChange={handleChange}
                name="hasAcademicTranscripts"
              />
            }
            label="Academic Transcripts (if applicable)"
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasCv || false}
                onChange={handleChange}
                name="hasCv"
              />
            }
            label="CV/Resume"
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasProofOfAddress || false}
                onChange={handleChange}
                name="hasProofOfAddress"
              />
            }
            label="Proof of Address"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Other Documents"
            name="otherDocuments"
            multiline
            rows={2}
            value={formData.otherDocuments || ''}
            onChange={handleChange}
            helperText="List any other documents you have available for your application"
          />
        </Grid>
      </Grid>
    </>
  );
};

// Additional Information Step
const AdditionalInfoStep = ({ formData, onChange }) => {
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    onChange({ [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Additional Information
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <Typography variant="subtitle1" gutterBottom>
              Do you need assistance with funding/bursary applications?
            </Typography>
            <RadioGroup
              name="needsFundingAssistance"
              value={formData.needsFundingAssistance || 'no'}
              onChange={handleChange}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>
        
        {formData.needsFundingAssistance === 'yes' && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Funding Details"
              name="fundingDetails"
              multiline
              rows={3}
              value={formData.fundingDetails || ''}
              onChange={handleChange}
              helperText="Please provide details about the type of funding assistance you need"
            />
          </Grid>
        )}
        
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <Typography variant="subtitle1" gutterBottom>
              Do you need assistance with accommodation applications?
            </Typography>
            <RadioGroup
              name="needsAccommodationAssistance"
              value={formData.needsAccommodationAssistance || 'no'}
              onChange={handleChange}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Special Requirements"
            name="specialRequirements"
            multiline
            rows={3}
            value={formData.specialRequirements || ''}
            onChange={handleChange}
            helperText="Any special requirements or additional information we should know"
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.agreeToTerms || false}
                onChange={handleChange}
                name="agreeToTerms"
                required
              />
            }
            label="I agree that the information provided is accurate and complete"
          />
        </Grid>
      </Grid>
    </>
  );
};

const UniversityApplicationForm = () => {
  const { currentUser } = useAuth();
  
  // Define form steps
  const steps = [
    'Personal Information',
    'Education Background',
    'University Preferences',
    'Supporting Documents',
    'Additional Information'
  ];
  
  // Define step components
  const stepComponents = [
    PersonalInfoStep,
    EducationStep,
    UniversityStep,
    DocumentsStep,
    AdditionalInfoStep
  ];
  
  // Initial form data with user information if available
  const initialData = {
    firstName: currentUser?.displayName?.split(' ')[0] || '',
    lastName: currentUser?.displayName?.split(' ').slice(1).join(' ') || '',
    email: currentUser?.email || '',
    phoneNumber: currentUser?.phoneNumber || '',
    universities: [],
    needsFundingAssistance: 'no',
    needsAccommodationAssistance: 'no',
    agreeToTerms: false
  };
  
  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      if (useLocalStorage) {
        const res = localDb.collection('serviceRequests').add(formData);
        return res.id;
      }
      const docRef = await addDoc(collection(db, 'serviceRequests'), formData);
      return docRef.id;
    } catch (error) {
      console.error('Error submitting university application request:', error);
      throw new Error('Failed to submit university application request. Please try again.');
    }
  };
  
  return (
    <ServiceRequestForm
      title="University Application Request Form"
      steps={steps}
      stepComponents={stepComponents}
      initialData={initialData}
      onSubmit={handleSubmit}
      serviceType="university_application"
    />
  );
};

export default UniversityApplicationForm;