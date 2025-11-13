import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';

const CVBuilder = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            CV Builder
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This feature is under construction. Please check back soon.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default CVBuilder;