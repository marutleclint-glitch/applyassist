import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Paper, Typography, Box, TextField, Button, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useLocalStorage, localDb } from '../firebase/config';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const VerifyEmail = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState(query.get('email') || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      setError('Missing email. Please open verification from the sign-in page.');
    }
  }, [email]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || !code) {
      setError('Enter your email and verification code.');
      return;
    }
    try {
      setLoading(true);
      if (useLocalStorage) {
        const verifications = localDb.collection('verifications').where('email', '==', email).get().docs;
        if (!verifications || verifications.length === 0) {
          throw new Error('No verification request found. Request a new code via sign-in.');
        }
        const match = verifications.find(v => v.data().code === code);
        if (!match) {
          throw new Error('Invalid code.');
        }
        const data = match.data();
        if (Date.now() > data.expiresAt) {
          throw new Error('Code expired. Please request a new one.');
        }
        // Mark user verified
        const userDocs = localDb.collection('users').where('email', '==', email).get().docs;
        if (!userDocs || userDocs.length === 0) {
          throw new Error('User not found for this email.');
        }
        const userDoc = userDocs[0];
        localDb.collection('users').doc(userDoc.id).update({ isVerified: true });
        // Optionally remove codes
        // localDb.collection('verifications').doc(match.id).delete();
        setSuccess('Email verified. You can sign in now.');
        // Attempt auto login by prompting for password if stored; otherwise redirect
        navigate('/login');
        return;
      }
      // For Firebase mode, you would store verifications in Firestore and validate here.
      throw new Error('Verification flow for production not yet configured.');
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Verify Your Email
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Box component="form" onSubmit={handleVerify}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Verification Code"
              margin="normal"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmail;