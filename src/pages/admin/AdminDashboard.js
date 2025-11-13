import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Tabs, Tab, 
  Button, Divider, List, ListItem, ListItemText, 
  Chip, Grid, Card, CardContent
} from '@mui/material';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { AuthContext } from '../../context/AuthContext';
import AdminApplications from './AdminApplications';
import AdminUsers from './AdminUsers';
import AdminOrders from './AdminOrders';
import AdminBankingSettings from './AdminBankingSettings';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalUsers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get applications stats
        const applicationsSnapshot = await getDocs(collection(db, 'applications'));
        const applications = [];
        applicationsSnapshot.forEach(doc => {
          applications.push({ id: doc.id, ...doc.data() });
        });
        
        // Get users count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersCount = usersSnapshot.size;
        
        // Get service requests (orders) stats
        const ordersSnapshot = await getDocs(collection(db, 'serviceRequests'));
        const orders = [];
        ordersSnapshot.forEach(doc => {
          orders.push({ id: doc.id, ...doc.data() });
        });
        
        // Calculate application stats
        const pending = applications.filter(app => app.status === 'pending').length;
        const approved = applications.filter(app => app.status === 'approved').length;
        const rejected = applications.filter(app => app.status === 'rejected').length;
        
        // Calculate order stats
        const pendingOrders = orders.filter(order => order.status === 'pending' || !order.status).length;
        const completedOrders = orders.filter(order => order.status === 'completed').length;
        
        setStats({
          totalApplications: applications.length,
          pendingApplications: pending,
          approvedApplications: approved,
          rejectedApplications: rejected,
          totalUsers: usersCount,
          totalOrders: orders.length,
          pendingOrders: pendingOrders,
          completedOrders: completedOrders
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }
    };
    
    fetchStats();
  }, [db]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Applications Stats */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Applications</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Total Applications:</Typography>
              <Typography variant="body1" fontWeight="bold">{stats.totalApplications}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Pending:</Typography>
              <Chip label={stats.pendingApplications} color="warning" size="small" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Approved:</Typography>
              <Chip label={stats.approvedApplications} color="success" size="small" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Rejected:</Typography>
              <Chip label={stats.rejectedApplications} color="error" size="small" />
            </Box>
          </Paper>
        </Grid>
        
        {/* Users and Orders Stats */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Users & Orders</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Total Users:</Typography>
              <Typography variant="body1" fontWeight="bold">{stats.totalUsers}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Total Orders:</Typography>
              <Typography variant="body1" fontWeight="bold">{stats.totalOrders}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Pending Orders:</Typography>
              <Chip label={stats.pendingOrders} color="warning" size="small" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Completed Orders:</Typography>
              <Chip label={stats.completedOrders} color="success" size="small" />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Applications" />
            <Tab label="Users" />
            <Tab label="Orders" />
            <Tab label="Banking Settings" />
          </Tabs>
        </Box>
        <Box sx={{ p: 2 }}>
          {tabValue === 0 && <AdminApplications />}
          {tabValue === 1 && <AdminUsers />}
          {tabValue === 2 && <AdminOrders />}
          {tabValue === 3 && <AdminBankingSettings />}
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;