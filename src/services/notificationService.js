import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Creates a new notification for a user
 * @param {string} userId - The ID of the user to notify
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} type - The notification type (order_update, order_completed, order_rejected, chat_message)
 * @param {Object} metadata - Additional data related to the notification (orderId, applicationId, chatId)
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createNotification = async (userId, title, message, type, metadata = {}) => {
  try {
    const notificationData = {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: serverTimestamp(),
      ...metadata
    };

    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Marks a notification as read
 * @param {string} notificationId - The ID of the notification to mark as read
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Marks all notifications for a user as read
 * @param {string} userId - The ID of the user
 * @returns {Promise<void>}
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Creates a notification for order status updates
 * @param {Object} order - The order object
 * @param {string} previousStatus - The previous status of the order
 * @param {string} newStatus - The new status of the order
 * @returns {Promise<string>} - The ID of the created notification
 */
export const createOrderStatusNotification = async (order, previousStatus, newStatus) => {
  const userId = order.userId;
  let title, message, type;

  if (newStatus === 'completed') {
    title = 'Order Completed';
    message = `Your ${order.serviceType} request has been completed.`;
    type = 'order_completed';
  } else if (newStatus === 'rejected') {
    title = 'Order Rejected';
    message = `Your ${order.serviceType} request has been rejected.`;
    type = 'order_rejected';
  } else {
    title = 'Order Status Updated';
    message = `Your ${order.serviceType} request status changed from ${previousStatus} to ${newStatus}.`;
    type = 'order_update';
  }

  return createNotification(userId, title, message, type, { orderId: order.id });
};

// Create notification for a chat message to a specific user
export const createChatMessageNotificationForUser = async (recipientUserId, orderId, senderName, messageSnippet = '') => {
  const title = 'New Chat Message';
  const message = messageSnippet ? `${senderName}: ${messageSnippet}` : `${senderName} sent a new message.`;
  return createNotification(recipientUserId, title, message, 'chat_message', { orderId });
};

// Notify all admins about a chat message from a user
export const notifyAdminsOfChatMessage = async (orderId, senderName, messageSnippet = '') => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('role', '==', 'admin'));
  const snapshot = await getDocs(q);
  const title = 'New Chat Message';
  const message = messageSnippet ? `${senderName}: ${messageSnippet}` : `${senderName} sent a new message.`;
  const promises = snapshot.docs.map(docItem => 
    createNotification(docItem.id, title, message, 'chat_message', { orderId })
  );
  await Promise.all(promises);
};

export default {
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createOrderStatusNotification,
  createChatMessageNotificationForUser,
  notifyAdminsOfChatMessage
};