import React from 'react';
import { 
  Typography, TextField, Grid, FormControl, 
  InputLabel, Select, MenuItem, FormHelperText,
  Box, Divider, FormControlLabel, Checkbox
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import ServiceRequestForm from '../components/ServiceRequestForm';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

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

// Education Step
const EducationStep = ({ formData, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...(formData.education || [])];
    if (!updatedEducation[index]) {
      updatedEducation[index] = {};
    }
    updatedEducation[index][field] = value;
    onChange({ education: updatedEducation });
  };

  // Ensure we have at least one education entry
  const education = formData.education || [{}];

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Education Background
      </Typography>
      
      {education.map((edu, index) => (
        <Box key={index} sx={{ mb: 4 }}>
          {index > 0 && <Divider sx={{ my: 2 }} />}
          
          <Typography variant="subtitle1" gutterBottom>
            Education #{index + 1}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Institution Name"
                value={edu.institution || ''}
                onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Degree/Certificate"
                value={edu.degree || ''}
                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Field of Study"
                value={edu.fieldOfStudy || ''}
                onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Start Year"
                type="number"
                value={edu.startYear || ''}
                onChange={(e) => handleEducationChange(index, 'startYear', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Year (or Expected)"
                type="number"
                value={edu.endYear || ''}
                onChange={(e) => handleEducationChange(index, 'endYear', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Achievements/Activities"
                multiline
                rows={3}
                value={edu.achievements || ''}
                onChange={(e) => handleEducationChange(index, 'achievements', e.target.value)}
                helperText="List any relevant achievements, activities, or honors"
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
          onClick={() => onChange({ education: [...education, {}] })}
        >
          + Add Another Education
        </Typography>
      </Box>
    </>
  );
};

// Work Experience Step
const ExperienceStep = ({ formData, onChange }) => {
  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...(formData.experience || [])];
    if (!updatedExperience[index]) {
      updatedExperience[index] = {};
    }
    updatedExperience[index][field] = value;
    onChange({ experience: updatedExperience });
  };

  // Ensure we have at least one experience entry
  const experience = formData.experience || [{}];

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Work Experience
      </Typography>
      
      {experience.map((exp, index) => (
        <Box key={index} sx={{ mb: 4 }}>
          {index > 0 && <Divider sx={{ my: 2 }} />}
          
          <Typography variant="subtitle1" gutterBottom>
            Experience #{index + 1}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Company/Organization"
                value={exp.company || ''}
                onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Position/Title"
                value={exp.position || ''}
                onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Start Date"
                type="month"
                InputLabelProps={{ shrink: true }}
                value={exp.startDate || ''}
                onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date (leave blank if current)"
                type="month"
                InputLabelProps={{ shrink: true }}
                value={exp.endDate || ''}
                onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Responsibilities and Achievements"
                multiline
                rows={4}
                value={exp.description || ''}
                onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                helperText="Describe your key responsibilities and achievements in this role"
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
          onClick={() => onChange({ experience: [...experience, {}] })}
        >
          + Add Another Experience
        </Typography>
      </Box>
    </>
  );
};

// Skills and Preferences Step
const SkillsStep = ({ formData, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleSkillChange = (index, value) => {
    const updatedSkills = [...(formData.skills || [''])];
    updatedSkills[index] = value;
    onChange({ skills: updatedSkills });
  };

  // Ensure we have at least one skill entry
  const skills = formData.skills || [''];

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Skills and Preferences
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>CV Type</InputLabel>
            <Select
              name="cvType"
              value={formData.cvType || ''}
              onChange={handleChange}
              label="CV Type"
            >
              <MenuItem value="professional">Professional</MenuItem>
              <MenuItem value="academic">Academic</MenuItem>
              <MenuItem value="entry-level">Entry Level</MenuItem>
              <MenuItem value="creative">Creative</MenuItem>
            </Select>
            <FormHelperText>Select the type of CV that best suits your needs</FormHelperText>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Skills
          </Typography>
          
          {skills.map((skill, index) => (
            <TextField
              key={index}
              fullWidth
              label={`Skill ${index + 1}`}
              value={skill}
              onChange={(e) => handleSkillChange(index, e.target.value)}
              sx={{ mb: 2 }}
            />
          ))}
          
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer' }}
              onClick={() => onChange({ skills: [...skills, ''] })}
            >
              + Add Another Skill
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Career Objective"
            name="objective"
            multiline
            rows={3}
            value={formData.objective || ''}
            onChange={handleChange}
            helperText="Brief statement about your career goals and aspirations"
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.includeCoverLetter || false}
                onChange={(e) => onChange({ includeCoverLetter: e.target.checked })}
                name="includeCoverLetter"
                color="primary"
              />
            }
            label="Include a Cover Letter"
          />
        </Grid>
        
        {formData.includeCoverLetter && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Cover Letter Details"
              name="coverLetterDetails"
              multiline
              rows={4}
              value={formData.coverLetterDetails || ''}
              onChange={handleChange}
              helperText="Provide details about the position and company for the cover letter"
            />
          </Grid>
        )}
      </Grid>
    </>
  );
};

// Additional Information Step
const AdditionalInfoStep = ({ formData, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Additional Information
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Languages"
            name="languages"
            value={formData.languages || ''}
            onChange={handleChange}
            helperText="List languages you speak and your proficiency level (e.g., English - Native, French - Intermediate)"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Certifications"
            name="certifications"
            multiline
            rows={2}
            value={formData.certifications || ''}
            onChange={handleChange}
            helperText="List any relevant certifications or professional qualifications"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="References"
            name="references"
            multiline
            rows={3}
            value={formData.references || ''}
            onChange={handleChange}
            helperText="Provide references or indicate 'References available upon request'"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Additional Notes"
            name="additionalNotes"
            multiline
            rows={4}
            value={formData.additionalNotes || ''}
            onChange={handleChange}
            helperText="Any other information you'd like us to know when creating your CV"
          />
        </Grid>
      </Grid>
    </>
  );
};

const CVRequestForm = () => {
  const { currentUser } = useAuth();
  
  // Define form steps
  const steps = [
    'Personal Information',
    'Education',
    'Work Experience',
    'Skills & Preferences',
    'Additional Information'
  ];
  
  // Define step components
  const stepComponents = [
    PersonalInfoStep,
    EducationStep,
    ExperienceStep,
    SkillsStep,
    AdditionalInfoStep
  ];
  
  // Initial form data with user information if available
  const initialData = {
    firstName: currentUser?.displayName?.split(' ')[0] || '',
    lastName: currentUser?.displayName?.split(' ').slice(1).join(' ') || '',
    email: currentUser?.email || '',
    phoneNumber: currentUser?.phoneNumber || '',
    education: [{}],
    experience: [{}],
    skills: [''],
    includeCoverLetter: false
  };
  
  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      // Add the form data to Firestore
      const docRef = await addDoc(collection(db, 'serviceRequests'), formData);
      return docRef.id; // Return the document ID for payment processing
    } catch (error) {
      console.error('Error submitting CV request:', error);
      throw new Error('Failed to submit CV request. Please try again.');
    }
  };
  
  return (
    <ServiceRequestForm
      title="CV/Resume Request Form"
      steps={steps}
      stepComponents={stepComponents}
      initialData={initialData}
      onSubmit={handleSubmit}
      serviceType="cv_creation"
    />
  );
};

export default CVRequestForm;