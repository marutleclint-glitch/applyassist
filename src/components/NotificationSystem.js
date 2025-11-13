import React, { useState, useEffect, useContext } from 'react';
import { 
  Badge, 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography, 
  Box, 
  Divider, 
  ListItemText, 
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuthContext } from '../context/AuthContext';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    // Set up real-time listener for notifications
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData = [];
      let unread = 0;

      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        notificationData.push(data);
        
        if (!data.read) {
          unread++;
        }
      });

      setNotifications(notificationData);
      setUnreadCount(unread);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    // Mark notification as read
    if (!notification.read) {
      try {
        const notificationRef = doc(db, 'notifications', notification.id);
        await updateDoc(notificationRef, {
          read: true
        });
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    // Navigate based on notification type
    if (notification.type === 'order_update' && notification.orderId) {
      navigate(`/order/${notification.orderId}`);
    } else if (notification.type === 'application_update' && notification.applicationId) {
      navigate(`/applications/${notification.applicationId}`);
    } else if (notification.type === 'chat_message' && notification.orderId) {
      navigate(`/chat?orderId=${notification.orderId}`);
    }

    handleClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_update':
        return <InfoIcon color="primary" />;
      case 'order_completed':
        return <CheckCircleIcon color="success" />;
      case 'order_rejected':
        return <ErrorIcon color="error" />;
      case 'chat_message':
        return <InfoIcon color="info" />;
      default:
        return <AccessTimeIcon color="action" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick} size="large">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
            overflow: 'auto',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="subtitle1">Notifications</Typography>
        </Box>
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem 
              key={notification.id} 
              onClick={() => handleNotificationClick(notification)}
              sx={{ 
                bgcolor: notification.read ? 'inherit' : 'action.hover',
                py: 1.5
              }}
            >
              <ListItemIcon>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText 
                primary={notification.title}
                secondary={
                  <React.Fragment>
                    <Typography variant="body2" component="span" color="text.primary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {formatTimestamp(notification.createdAt)}
                    </Typography>
                  </React.Fragment>
                }
              />
            </MenuItem>
          ))
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationSystem;