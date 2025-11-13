import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';

const ApplicationForm = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Application Form
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This form is under construction. Please use the University Application or CV Request forms for now.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ApplicationForm;