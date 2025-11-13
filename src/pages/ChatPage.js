import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Chat from '../components/Chat';
import { db, useLocalStorage, localDb } from '../firebase/config';
import { Box, Typography, List, ListItem, ListItemText, Divider, Badge } from '@mui/material';
import { collection, query, where, getDocs } from 'firebase/firestore';

const ChatPage = () => {
  const location = useLocation();
  const { currentUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;

      let userOrders = [];
      if (useLocalStorage) {
        const snapshot = currentUser?.role === 'admin'
          ? localDb.collection('orders').get()
          : localDb.collection('orders').where('userId', '==', currentUser?.uid).get();
        userOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      } else {
        let q;
        if (currentUser.role === 'admin') {
          q = query(collection(db, 'orders'));
        } else {
          q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
        }
        const querySnapshot = await getDocs(q);
        userOrders = [];
        querySnapshot.forEach((doc) => {
          userOrders.push({ id: doc.id, ...doc.data() });
        });
      }

      setOrders(userOrders);

      const params = new URLSearchParams(location.search);
      const orderIdParam = params.get('orderId');
      if (orderIdParam) {
        setSelectedOrderId(orderIdParam);
      } else if (userOrders.length > 0) {
        setSelectedOrderId(userOrders[0].id);
      }
    };

    fetchOrders();
  }, [currentUser, location.search]);

  const handleOrderClick = (orderId) => {
    setSelectedOrderId(orderId);
  };

  return (
    <Box display="flex" height="100%">
      <Box width={300} borderRight="1px solid #ddd" overflow="auto">
        <Typography variant="h6" sx={{ p: 2 }}>Orders</Typography>
        <Divider />
        {orders.length === 0 ? (
          <Typography sx={{ p: 2 }} color="text.secondary">No client orders found.</Typography>
        ) : (
          <List>
            {orders.map((order) => (
              <ListItem button key={order.id} selected={order.id === selectedOrderId} onClick={() => handleOrderClick(order.id)}>
                <Badge color="secondary" variant="dot" invisible={!order.hasUnreadMessages} sx={{ mr: 1 }} />
                <ListItemText primary={order.title || `Order ${order.id}`} secondary={order.status || 'Pending'} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      <Box flexGrow={1}>
        {selectedOrderId ? (
          <Chat orderId={selectedOrderId} />
        ) : (
          <Box p={3}>
            <Typography color="text.secondary">Select an order to view chat.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatPage;