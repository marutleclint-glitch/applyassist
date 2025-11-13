import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  Divider,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import { Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const AdminBankingSettings = () => {
  const [bankingDetails, setBankingDetails] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    branchCode: '',
    swiftCode: '',
    reference: 'RMGT-Payment'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBankingDetails();
  }, []);

  const fetchBankingDetails = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'settings', 'banking');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setBankingDetails({ ...bankingDetails, ...docSnap.data() });
      }
    } catch (error) {
      console.error('Error fetching banking details:', error);
      setMessage({ type: 'error', text: 'Failed to load banking details' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const docRef = doc(db, 'settings', 'banking');
      await setDoc(docRef, {
        ...bankingDetails,
        updatedAt: new Date(),
        updatedBy: 'admin' // You can replace with actual admin user ID
      }, { merge: true });
      
      setMessage({ type: 'success', text: 'Banking details saved successfully!' });
    } catch (error) {
      console.error('Error saving banking details:', error);
      setMessage({ type: 'error', text: 'Failed to save banking details' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchBankingDetails();
    setMessage({ type: '', text: '' });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Banking Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage banking details for EFT payments and instructions
        </Typography>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Card>
          <CardHeader 
            title="Bank Account Details"
            subheader="These details will be used for EFT payment instructions"
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  name="bankName"
                  value={bankingDetails.bankName}
                  onChange={handleInputChange}
                  placeholder="e.g., Standard Bank"
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Account Name"
                  name="accountName"
                  value={bankingDetails.accountName}
                  onChange={handleInputChange}
                  placeholder="e.g., RMGT Services"
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Account Number"
                  name="accountNumber"
                  value={bankingDetails.accountNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 1234567890"
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Branch Code"
                  name="branchCode"
                  value={bankingDetails.branchCode}
                  onChange={handleInputChange}
                  placeholder="e.g., 051001"
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SWIFT Code (Optional)"
                  name="swiftCode"
                  value={bankingDetails.swiftCode}
                  onChange={handleInputChange}
                  placeholder="e.g., SBZAZAJJ"
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Payment Reference"
                  name="reference"
                  value={bankingDetails.reference}
                  onChange={handleInputChange}
                  placeholder="e.g., RMGT-Payment"
                  disabled={loading}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                disabled={loading || saving}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading || saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardHeader 
            title="Preview EFT Instructions"
            subheader="This is how the banking details will appear to customers"
          />
          <CardContent>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                EFT Payment Instructions
              </Typography>
              <Typography variant="body2" paragraph>
                Please transfer the payment amount to the following account:
              </Typography>
              <Box sx={{ ml: 2 }}>
                <Typography variant="body2"><strong>Bank:</strong> {bankingDetails.bankName || 'Not set'}</Typography>
                <Typography variant="body2"><strong>Account Name:</strong> {bankingDetails.accountName || 'Not set'}</Typography>
                <Typography variant="body2"><strong>Account Number:</strong> {bankingDetails.accountNumber || 'Not set'}</Typography>
                <Typography variant="body2"><strong>Branch Code:</strong> {bankingDetails.branchCode || 'Not set'}</Typography>
                {bankingDetails.swiftCode && (
                  <Typography variant="body2"><strong>SWIFT Code:</strong> {bankingDetails.swiftCode}</Typography>
                )}
                <Typography variant="body2"><strong>Reference:</strong> {bankingDetails.reference || 'RMGT-Payment'}</Typography>
              </Box>
            </Paper>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default AdminBankingSettings;