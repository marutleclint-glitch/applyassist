import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Resumes from './pages/Resumes';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import ApplicationForm from './pages/ApplicationForm';
import CVBuilder from './pages/CVBuilder';
import Profile from './pages/Profile';
import CVRequestForm from './pages/CVRequestForm';
import UniversityApplicationForm from './pages/UniversityApplicationForm';
import Bursaries from './pages/Bursaries';
import BursaryApplicationForm from './pages/BursaryApplicationForm';
import Payment from './pages/Payment';
import PaymentProcess from './pages/PaymentProcess';
import ChatPage from './pages/ChatPage';
import PrivateRoute from './components/PrivateRoute';
import { ApplicationProvider } from './context/ApplicationContext';
import { AuthProvider } from './context/AuthContext';
import OrderDetails from './pages/OrderDetails';
import VerifyEmail from './pages/VerifyEmail';
import MotivationalLetterForm from './pages/MotivationalLetterForm';
import Poster from './pages/Poster';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.2rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ApplicationProvider>
          <Router>
            <div className="app-container">
              <Header />
              <div className="content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/applications" element={
                    <PrivateRoute>
                      <Applications />
                    </PrivateRoute>
                  } />
                  <Route path="/resumes" element={
                    <PrivateRoute>
                      <Resumes />
                    </PrivateRoute>
                  } />
                  <Route path="/settings" element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  } />
                  <Route path="/apply/:formType" element={
                    <PrivateRoute>
                      <ApplicationForm />
                    </PrivateRoute>
                  } />
                  <Route path="/cv-builder" element={
                    <PrivateRoute>
                      <CVBuilder />
                    </PrivateRoute>
                  } />
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } />
                  <Route path="/cv-request" element={
                    <PrivateRoute>
                      <CVRequestForm />
                    </PrivateRoute>
                  } />
                  <Route path="/university-application" element={
                    <PrivateRoute>
                      <UniversityApplicationForm />
                    </PrivateRoute>
                  } />
                  <Route path="/bursaries" element={
                    <PrivateRoute>
                      <Bursaries />
                    </PrivateRoute>
                  } />
                  <Route path="/bursary-application" element={
                    <PrivateRoute>
                      <BursaryApplicationForm />
                    </PrivateRoute>
                  } />
                  <Route path="/payment/:paymentId" element={
                    <PrivateRoute>
                      <Payment />
                    </PrivateRoute>
                  } />
                  <Route path="/payment-process/:paymentId" element={
                    <PrivateRoute>
                      <PaymentProcess />
                    </PrivateRoute>
                  } />
                  <Route path="/chat" element={
                    <PrivateRoute>
                      <ChatPage />
                    </PrivateRoute>
                  } />
                  <Route path="/order/:orderId" element={
                    <PrivateRoute>
                      <OrderDetails />
                    </PrivateRoute>
                  } />
                  <Route path="/motivational-letter" element={
                    <PrivateRoute>
                      <MotivationalLetterForm />
                    </PrivateRoute>
                  } />
                  {/* Poster Preview Route */}
                  <Route path="/poster" element={
                    <PrivateRoute>
                      <Poster />
                    </PrivateRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/*" element={
                    <PrivateRoute requireAdmin={true}>
                      <AdminDashboard />
                    </PrivateRoute>
                  } />
                  
                  {/* Fallback Route */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </div>
          </Router>
        </ApplicationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;