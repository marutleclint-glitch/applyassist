import React, { useState, useMemo } from 'react';
import { Container, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Box, Grid, Button, Chip } from '@mui/material';
import { FIELDS_OF_STUDY, getOpenBursariesByField } from '../services/bursariesService';
import { useNavigate } from 'react-router-dom';

const Bursaries = () => {
  const [field, setField] = useState('');
  const navigate = useNavigate();
  
  const bursaries = useMemo(() => getOpenBursariesByField(field), [field]);

  const handleApply = (bursary) => {
    // Navigate to bursary application form with prefilled context
    navigate('/bursary-application', { state: { selectedBursary: bursary } });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Available Bursaries
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Filter by your field of study to see bursaries that are currently open. Closing dates are enforced.
        </Typography>
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Field of Study</InputLabel>
          <Select
            value={field}
            label="Field of Study"
            onChange={(e) => setField(e.target.value)}
          >
            <MenuItem value="">All Fields</MenuItem>
            {FIELDS_OF_STUDY.map(f => (
              <MenuItem key={f} value={f}>{f}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Grid container spacing={2}>
          {bursaries.map(b => (
            <Grid item xs={12} key={b.id}>
              <Paper variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">{b.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Provider: {b.provider} • Field: {b.field}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>Amount: {b.amount}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip label={`Closes: ${new Date(b.closingDate).toLocaleDateString()}`} size="small" color="warning" sx={{ mr: 1 }} />
                    <Button href={b.website} target="_blank" rel="noopener" size="small">Visit Website</Button>
                  </Box>
                </Box>
                <Box>
                  <Button variant="contained" onClick={() => handleApply(b)}>Apply</Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        {bursaries.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            No open bursaries matched your filter. Try another field or check back later.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default Bursaries;