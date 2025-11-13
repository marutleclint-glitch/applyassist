import React from 'react';
import { Box, Container, Typography, Button, Stack, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Landing = () => {
  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
            Apply Assist
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 2, color: 'text.secondary' }}>
            Track applications, build resumes, and manage your job search efficiently.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4, justifyContent: 'center' }}>
            <Button variant="contained" color="primary" component={RouterLink} to="/register">
              Get Started
            </Button>
            <Button variant="outlined" component={RouterLink} to="/login">
              Log In
            </Button>
          </Stack>
        </Paper>

        <Stack spacing={3} sx={{ mt: 6 }}>
          <Paper elevation={0} sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Stay Organized</Typography>
            <Typography sx={{ mt: 1, color: 'text.secondary' }}>
              Keep track of applications, deadlines, and documents all in one place.
            </Typography>
          </Paper>
          <Paper elevation={0} sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Build and Store Resumes</Typography>
            <Typography sx={{ mt: 1, color: 'text.secondary' }}>
              Create and manage tailored resumes and cover letters for each opportunity.
            </Typography>
          </Paper>
          <Paper elevation={0} sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>Collaborate</Typography>
            <Typography sx={{ mt: 1, color: 'text.secondary' }}>
              Chat and share updates within your network to stay on top of progress.
            </Typography>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};

export default Landing;