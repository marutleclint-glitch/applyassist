import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

// Function to seed sample notifications for a user
export const seedSampleNotifications = async (userId) => {
  try {
    const notifications = [
      {
        userId,
        title: 'Order Status Updated',
        message: 'Your CV writing request status changed from pending to in_progress.',
        type: 'order_update',
        read: false,
        createdAt: serverTimestamp(),
        orderId: 'sample-order-1'
      },
      {
        userId,
        title: 'Order Completed',
        message: 'Your university application request has been completed.',
        type: 'order_completed',
        read: false,
        createdAt: serverTimestamp(),
        orderId: 'sample-order-2'
      },
      {
        userId,
        title: 'New Chat Message',
        message: 'You have a new message regarding your bursary application.',
        type: 'chat_message',
        read: true,
        createdAt: serverTimestamp(),
        chatId: 'sample-chat-1'
      }
    ];

    const addPromises = notifications.map(notification => 
      addDoc(collection(db, 'notifications'), notification)
    );

    await Promise.all(addPromises);
    console.log('Sample notifications seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding notifications:', error);
    return false;
  }
};

export default seedSampleNotifications;