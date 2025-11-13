import axios from 'axios';
import { db, useLocalStorage, localDb } from '../firebase/config';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

// Mock PayFast API for development
const MOCK_API_ENDPOINT = 'https://api.payfast.mock';

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Service types and their prices
export const SERVICE_TYPES = {
  UNIVERSITY_APPLICATION: {
    id: 'university_application',
    name: 'University Application',
    price: 100.00,
    description: 'Professional assistance with university applications'
  },
  BURSARY_APPLICATION: {
    id: 'bursary_application',
    name: 'Bursary Application',
    price: 100.00,
    description: 'Expert help with bursary applications'
  },
  JOB_APPLICATION: {
    id: 'job_application',
    name: 'Job Application',
    price: 150.00,
    description: 'Professional assistance with job applications'
  },
  CV_CREATION: {
    id: 'cv_creation',
    name: 'Professional CV Creation',
    price: 70.00,
    description: 'Custom CV creation tailored to your experience and target positions'
  },
  MOTIVATIONAL_LETTER: {
    id: 'motivational_letter',
    name: 'Motivational Letter',
    price: 50.00,
    description: 'Professionally written motivational letter tailored to your application'
  }
};

/**
 * Create a new payment record in the database
 * @param {Object} paymentData - Payment information
 * @returns {Promise<Object>} - Payment record with ID
 */
export const createPayment = async (paymentData) => {
  try {
    const paymentRecord = {
      ...paymentData,
      status: PAYMENT_STATUS.PENDING,
      createdAt: new Date().toISOString()
    };

    if (useLocalStorage) {
      const result = localDb.collection('payments').add(paymentRecord);
      return { id: result.id, ...paymentRecord };
    } else {
      const docRef = await addDoc(collection(db, 'payments'), paymentRecord);
      return { id: docRef.id, ...paymentRecord };
    }
  } catch (error) {
    console.error('Error creating payment record:', error);
    throw error;
  }
};

/**
 * Generate a mock PayFast payment URL
 * @param {Object} order - Order details
 * @param {Object} user - User information
 * @returns {Promise<string>} - Payment URL
 */
export const generatePaymentUrl = async (order, user) => {
  try {
    // Create payment record first
    const payment = await createPayment({
      orderId: order.id,
      userId: user.uid,
      amount: order.amount,
      serviceType: order.serviceType,
      merchantReference: `ORDER-${Date.now()}`
    });

    // In a real implementation, this would make an API call to PayFast
    // For mock purposes, we'll just return a URL with the payment ID
    return `${window.location.origin}/payment-process/${payment.id}`;
  } catch (error) {
    console.error('Error generating payment URL:', error);
    throw error;
  }
};

/**
 * Process a mock payment
 * @param {string} paymentId - Payment ID
 * @param {Object} paymentDetails - Payment details including card information
 * @returns {Promise<Object>} - Updated payment record
 */
export const processPayment = async (paymentId, paymentDetails) => {
  try {
    // Update payment status to processing
    await updatePaymentStatus(paymentId, PAYMENT_STATUS.PROCESSING);
    
    // Mock API call to process payment
    // In a real implementation, this would call the PayFast API
    const mockResponse = await mockPaymentProcess(paymentDetails);
    
    if (mockResponse.success) {
      // Update payment status to completed
      await updatePaymentStatus(paymentId, PAYMENT_STATUS.COMPLETED);
      return { success: true, message: 'Payment processed successfully' };
    } else {
      // Update payment status to failed
      await updatePaymentStatus(paymentId, PAYMENT_STATUS.FAILED);
      return { success: false, message: mockResponse.message };
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    await updatePaymentStatus(paymentId, PAYMENT_STATUS.FAILED);
    throw error;
  }
};

/**
 * Update payment status
 * @param {string} paymentId - Payment ID
 * @param {string} status - New payment status
 * @returns {Promise<void>}
 */
export const updatePaymentStatus = async (paymentId, status) => {
  try {
    if (useLocalStorage) {
      localDb.collection('payments').doc(paymentId).update({ 
        status, 
        updatedAt: new Date().toISOString() 
      });
    } else {
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, { 
        status, 
        updatedAt: new Date().toISOString() 
      });
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

/**
 * Get payment details
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} - Payment details
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    if (useLocalStorage) {
      const doc = await localDb.collection('payments').doc(paymentId).get();
      if (doc.exists) {
        return doc.data();
      }
      return null;
    } else {
      const paymentRef = doc(db, 'payments', paymentId);
      const paymentSnap = await getDoc(paymentRef);
      
      if (paymentSnap.exists()) {
        return { id: paymentSnap.id, ...paymentSnap.data() };
      }
      return null;
    }
  } catch (error) {
    console.error('Error getting payment details:', error);
    throw error;
  }
};

/**
 * Mock function to simulate payment processing
 * @param {Object} paymentDetails - Payment details
 * @returns {Promise<Object>} - Mock response
 */
const mockPaymentProcess = async (paymentDetails) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Validate card number (mock validation)
  const cardNumber = paymentDetails.cardNumber.replace(/\s/g, '');
  
  // Mock validation: Card number must be 16 digits and start with 4 (Visa) or 5 (MasterCard)
  if (!/^[45]\d{15}$/.test(cardNumber)) {
    return { success: false, message: 'Invalid card number' };
  }
  
  // Mock validation: Expiry date must be in the future
  const [expMonth, expYear] = paymentDetails.expiryDate.split('/');
  const expiryDate = new Date(2000 + parseInt(expYear), parseInt(expMonth) - 1);
  if (expiryDate < new Date()) {
    return { success: false, message: 'Card has expired' };
  }
  
  // Mock validation: CVV must be 3 digits
  if (!/^\d{3}$/.test(paymentDetails.cvv)) {
    return { success: false, message: 'Invalid CVV' };
  }
  
  // Success response (90% success rate for testing)
  if (Math.random() < 0.9) {
    return {
      success: true,
      transactionId: `MOCK-${Date.now()}`,
      message: 'Payment processed successfully'
    };
  } else {
    // Random failure for testing error handling
    const errors = [
      'Insufficient funds',
      'Card declined by bank',
      'Network error',
      'Transaction timed out'
    ];
    return {
      success: false,
      message: errors[Math.floor(Math.random() * errors.length)]
    };
  }
};

/**
 * Generate EFT payment instructions
 * @param {Object} order - Order details
 * @returns {Object} - EFT payment instructions
 */
export const generateEFTInstructions = async (order) => {
  try {
    // Fetch banking details from Firestore
    const bankingDocRef = doc(db, 'settings', 'banking');
    const bankingDoc = await getDoc(bankingDocRef);
    
    let bankingDetails = {
      bankName: 'First National Bank',
      accountName: 'ApplyAssist Services',
      accountNumber: '62123456789',
      branchCode: '250655',
      reference: 'RMGT-Payment'
    };
    
    // Use dynamic banking details if available
    if (bankingDoc.exists()) {
      bankingDetails = { ...bankingDetails, ...bankingDoc.data() };
    }
    
    return {
      bankName: bankingDetails.bankName,
      accountHolder: bankingDetails.accountName,
      accountNumber: bankingDetails.accountNumber,
      branchCode: bankingDetails.branchCode,
      swiftCode: bankingDetails.swiftCode,
      reference: `${bankingDetails.reference}-${order.id.substring(0, 8)}`,
      amount: order.amount,
      instructions: 'Please use the reference number provided above when making your payment.'
    };
  } catch (error) {
    console.error('Error fetching banking details:', error);
    // Fallback to default banking details
    return {
      bankName: 'First National Bank',
      accountHolder: 'ApplyAssist Services',
      accountNumber: '62123456789',
      branchCode: '250655',
      reference: `RMGT-Payment-${order.id.substring(0, 8)}`,
      amount: order.amount,
      instructions: 'Please use the reference number provided above when making your payment.'
    };
  }
};

// Helper: Get service definition by id
export const getServiceById = (id) => {
  return Object.values(SERVICE_TYPES).find((s) => s.id === id) || null;
};

// Helper: Get friendly service name by id
export const getServiceNameById = (id) => {
  const svc = getServiceById(id);
  return svc ? svc.name : id;
};