import { db, storage, useLocalStorage, localDb } from '../firebase/config';
import { 
  collection, addDoc, query, where, orderBy, 
  getDocs, doc, updateDoc, onSnapshot, serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createChatMessageNotificationForUser, notifyAdminsOfChatMessage } from './notificationService';

// Poll interval in milliseconds
const POLL_INTERVAL = 5000;

/**
 * Send a new message in a chat
 * @param {string} orderId - The order ID associated with the chat
 * @param {string} userId - The user ID of the sender
 * @param {string} content - The message content
 * @param {File} file - Optional file attachment
 * @returns {Promise<Object>} - The created message
 */
export const sendMessage = async (orderId, userId, content, file = null, options = {}) => {
  try {
    let fileUrl = null;
    let fileName = null;
    let fileType = null;
    const { senderRole = 'applicant', senderName = 'User' } = options;
    
    // Upload file if provided
    if (file) {
      fileName = file.name;
      fileType = file.type;
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `chats/${orderId}/${Date.now()}_${fileName}`);
      await uploadBytes(storageRef, file);
      fileUrl = await getDownloadURL(storageRef);
    }
    
    const message = {
      orderId,
      userId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      fileUrl,
      fileName,
      fileType
    };
    
    let createdMessage;
    if (useLocalStorage) {
      const result = localDb.collection('messages').add(message);
      createdMessage = { id: result.id, ...message };
    } else {
      const docRef = await addDoc(collection(db, 'messages'), {
        ...message,
        timestamp: serverTimestamp()
      });
      createdMessage = { id: docRef.id, ...message };
    }

    // After message creation, create notifications
    try {
      if (senderRole === 'admin') {
        // Notify order owner
        let orderOwnerId = null;
        if (!useLocalStorage) {
          // Try orders collection
          const orderDoc = await getDocs(query(collection(db, 'orders'), where('__name__', '==', orderId)));
          if (!orderDoc.empty) {
            const d = orderDoc.docs[0].data();
            orderOwnerId = d.userId;
          } else {
            // Fallback to serviceRequests
            const reqDoc = await getDocs(query(collection(db, 'serviceRequests'), where('__name__', '==', orderId)));
            if (!reqDoc.empty) {
              const d = reqDoc.docs[0].data();
              orderOwnerId = d.userId;
            }
          }
        } else {
          const od = localDb.collection('orders').doc(orderId).get();
          if (od.exists) {
            orderOwnerId = od.data().userId;
          }
        }
        if (orderOwnerId) {
          await createChatMessageNotificationForUser(orderOwnerId, orderId, senderName, content?.slice(0, 60));
        }
      } else {
        // Notify admins
        await notifyAdminsOfChatMessage(orderId, senderName, content?.slice(0, 60));
      }
    } catch (notifyErr) {
      console.error('Error creating chat notifications:', notifyErr);
    }

    return createdMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get all messages for a specific order
 * @param {string} orderId - The order ID
 * @returns {Promise<Array>} - Array of messages
 */
export const getMessages = async (orderId) => {
  try {
    if (useLocalStorage) {
      const snapshot = localDb.collection('messages')
        .where('orderId', '==', orderId)
        .get();
      const messages = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      return messages;
    } else {
      const q = query(
        collection(db, 'messages'),
        where('orderId', '==', orderId),
        orderBy('timestamp', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      return messages;
    }
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 * @param {string} orderId - The order ID
 * @param {string} userId - The user ID (messages not from this user will be marked as read)
 * @returns {Promise<void>}
 */
export const markMessagesAsRead = async (orderId, userId) => {
  try {
    if (useLocalStorage) {
      const snapshot = localDb.collection('messages')
        .where('orderId', '==', orderId)
        .get();
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(m => m.userId !== userId && m.read === false);
      msgs.forEach(m => {
        localDb.collection('messages').doc(m.id).update({ read: true });
      });
    } else {
      const q = query(
        collection(db, 'messages'),
        where('orderId', '==', orderId),
        where('userId', '!=', userId),
        where('read', '==', false)
      );
      const querySnapshot = await getDocs(q);
      const batch = [];
      querySnapshot.forEach((document) => {
        const messageRef = doc(db, 'messages', document.id);
        batch.push(updateDoc(messageRef, { read: true }));
      });
      await Promise.all(batch);
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Set up polling for new messages
 * @param {string} orderId - The order ID
 * @param {function} callback - Callback function to handle new messages
 * @returns {function} - Function to stop polling
 */
export const setupMessagePolling = (orderId, callback) => {
  let intervalId = null;
  let lastTimestamp = new Date().toISOString();

  const pollMessages = async () => {
    try {
      let messages = [];
      if (useLocalStorage) {
        const snapshot = localDb.collection('messages').get();
        messages = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(m => m.orderId === orderId && new Date(m.timestamp) > new Date(lastTimestamp))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      } else {
        const q = query(
          collection(db, 'messages'),
          where('orderId', '==', orderId),
          where('timestamp', '>', lastTimestamp),
          orderBy('timestamp', 'asc')
        );
        const querySnapshot = await getDocs(q);
        messages = [];
        querySnapshot.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() });
        });
      }
      if (messages.length > 0) {
        lastTimestamp = messages[messages.length - 1].timestamp;
        callback(messages);
      }
    } catch (error) {
      console.error('Error polling messages:', error);
    }
  };

  intervalId = setInterval(pollMessages, POLL_INTERVAL);
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};

/**
 * Set up real-time listener for new messages (Firestore only)
 * @param {string} orderId - The order ID
 * @param {function} callback - Callback function to handle new messages
 * @returns {function} - Function to unsubscribe
 */
export const setupMessageListener = (orderId, callback) => {
  if (useLocalStorage) {
    // Fall back to polling for localStorage
    return setupMessagePolling(orderId, callback);
  }
  
  const q = query(
    collection(db, 'messages'),
    where('orderId', '==', orderId),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages);
  });
};

/**
 * Get unread message count for a user
 * @param {string} userId - The user ID
 * @returns {Promise<number>} - Number of unread messages
 */
export const getUnreadMessageCount = async (userId) => {
  try {
    if (useLocalStorage) {
      const snapshot = localDb.collection('messages').get();
      const count = snapshot.docs
        .map(d => d.data())
        .filter(m => m.userId !== userId && m.read === false)
        .length;
      return count;
    } else {
      const q = query(
        collection(db, 'messages'),
        where('userId', '!=', userId),
        where('read', '==', false)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    }
  } catch (error) {
    console.error('Error getting unread message count:', error);
    throw error;
  }
};