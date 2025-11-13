import React, { useContext, useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ApplicationContext } from '../context/ApplicationContext';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getServiceNameById } from '../services/paymentService';

const Dashboard = () => {
  const { applications, getApplicationStats } = useContext(ApplicationContext);
  const { currentUser } = useAuth();
  const stats = getApplicationStats();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get recent applications (last 5)
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
    .slice(0, 5);

  // Fetch service requests
  useEffect(() => {
    const fetchServiceRequests = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const serviceRequestsRef = collection(db, 'serviceRequests');
        const q = query(serviceRequestsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const requests = [];
        querySnapshot.forEach((doc) => {
          requests.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setServiceRequests(requests.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5));
      } catch (error) {
        console.error('Error fetching service requests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServiceRequests();
  }, [currentUser]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
      <Box sx={{ my: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          Dashboard
        </Typography>
        
        <Grid container spacing={isMobile ? 2 : 3}>
          {/* Service Request Links */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom>
                Our Services
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Select a service to get started with your application
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        CV/Resume Request
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        Professional CV writing service tailored to your career goals
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        component={RouterLink} 
                        to="/cv-request"
                        fullWidth
                      >
                        Request CV
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        University Application
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        Get assistance with your university application process
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        component={RouterLink} 
                        to="/university-application"
                        fullWidth
                      >
                        Apply Now
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Bursary Application
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        Get help with bursary applications and funding opportunities
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        component={RouterLink} 
                        to="/bursary-application"
                        fullWidth
                      >
                        Apply for Bursary
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Motivational Letter
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        Professionally written motivational letter tailored to your application
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        component={RouterLink} 
                        to="/motivational-letter"
                        fullWidth
                      >
                        Request Letter
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Summary Stats */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Application Summary
              </Typography>
              <Typography variant="h3" align="center" sx={{ my: 3, fontSize: { xs: '2rem', sm: '3rem' } }}>
                {stats.total}
              </Typography>
              <Typography variant="body1" align="center" color="textSecondary">
                Total Applications
              </Typography>
              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                {stats.lastWeekCount} applications in the last 7 days
              </Typography>
            </Paper>
          </Grid>
          
          {/* Status Breakdown */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Status Breakdown
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {Object.entries(stats.statuses).map(([status, count]) => (
                  <Grid item xs={6} sm={4} key={status}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', py: 1 }}>
                        <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>{count}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {status}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
          
          {/* Recent Activities */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  variant={isMobile ? "fullWidth" : "standard"}
                  scrollButtons={isMobile ? "auto" : "standard"}
                >
                  <Tab label="Recent Applications" />
                  <Tab label="Service Requests" />
                </Tabs>
              </Box>
              
              {tabValue === 0 && (
                <>
                  {recentApplications.length > 0 ? (
                    <List>
                      {recentApplications.map((app, index) => (
                        <React.Fragment key={app.id}>
                          <ListItem 
                            button 
                            component={RouterLink} 
                            to={`/applications/${app.id}`}
                            sx={{ 
                              borderRadius: 1,
                              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                            }}
                          >
                            <ListItemText
                              primary={app.company}
                              secondary={
                                <>
                                  <Typography component="span" variant="body2" color="textPrimary">
                                    {app.position}
                                  </Typography>
                                  {` — ${app.status} • ${new Date(app.dateAdded).toLocaleDateString()}`}
                                </>
                              }
                            />
                          </ListItem>
                          {index < recentApplications.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body1" align="center" sx={{ py: 3 }}>
                      No applications yet. Start tracking your job applications!
                    </Typography>
                  )}
                </>
              )}
              
              {tabValue === 1 && (
                <>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : serviceRequests.length > 0 ? (
                    <List>
                      {serviceRequests.map((request, index) => (
                        <React.Fragment key={request.id}>
                          <ListItem 
                            button 
                            component={RouterLink} 
                            to={`/order/${request.id}`}
                            sx={{ 
                              borderRadius: 1,
                              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                            }}
                          >
                            <ListItemText
                              primary={getServiceNameById(request.serviceType) || request.serviceType}
                              secondary={
                                <>
                                  <Typography component="span" variant="body2" color="textPrimary">
                                    {request.status}
                                  </Typography>
                                  {` • ${request.createdAt ? new Date(request.createdAt.toDate()).toLocaleDateString() : 'N/A'}`}
                                </>
                              }
                            />
                          </ListItem>
                          {index < serviceRequests.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body1" align="center" sx={{ py: 3 }}>
                      No service requests yet. Try our services to get started!
                    </Typography>
                  )}
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;