import React from 'react';
import { Box, Container, Typography, Paper, Divider, Grid } from '@mui/material';

const Poster = () => {
  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f7fbff 0%, #e9f3ff 40%, #cfe6ff 100%)',
      py: 4,
    }}>
      <Container maxWidth="md">
        <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h3" sx={{ fontFamily: 'serif', fontWeight: 600, color: '#2d7fa3' }}>
              Emmanuel <span style={{ color: '#2d7fa3', fontWeight: 300 }}>tours</span>
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
              Transfers • Transportation & Tours
            </Typography>
            <Typography variant="h6" sx={{ mt: 2, fontStyle: 'italic', color: '#c08a2b' }}>
              “Impossibility made possible”
            </Typography>
          </Box>

          {/* Main banner: SCHOLAR TRANSPORT BETWEEN */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                display: 'inline-block',
                px: 2,
                py: 1,
                backgroundColor: '#111',
                color: '#fff',
                borderRadius: 1.5,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              SCHOLAR TRANSPORT BETWEEN
            </Typography>
          </Box>
          <Box sx={{ border: '2px solid #111', borderRadius: 2, p: 2, mb: 4 }}>
            <Typography variant="h5" align="center" sx={{ fontWeight: 800 }}>
              KANYAMAZANE, TEKWANE SOUTH, KARINO
            </Typography>
            <Typography variant="h5" align="center" sx={{ fontWeight: 800 }}>
              ESTATE NELSPRUIT & SURROUNDING AREAS
            </Typography>
          </Box>

          {/* OTHER SERVICES section */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography
              variant="h5"
              sx={{
                display: 'inline-block',
                px: 2,
                py: 1,
                backgroundColor: '#111',
                color: '#fff',
                borderRadius: 1.5,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              OTHER SERVICES
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ pl: 1 }}>
                <Typography>Organised Group Dinners</Typography>
                <Typography>Picnics</Typography>
                <Typography>Family Trips</Typography>
                <Typography>Private Hire</Typography>
                <Typography>Schools & Universities</Typography>
                <Typography>Government Institutions</Typography>
                <Typography>Corporate Clients</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ pl: 1 }}>
                <Typography>Airport & Lodge Transfers</Typography>
                <Typography>Kruger National Park Tours</Typography>
                <Typography>Durban Tours</Typography>
                <Typography>Eswatini (Swaziland) Tours</Typography>
                <Typography>Mozambique Tours</Typography>
                <Typography>Cape Town Tours</Typography>
                <Typography>Panorama Route Tours</Typography>
                <Typography>Sun City Tour</Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Contact */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              071 568 4080 / 072 948 4844
            </Typography>
            <Typography sx={{ mt: 1 }}>
              XOLANI82765@GMAIL.COM • WWW.EMMANUELTOURS
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Poster;