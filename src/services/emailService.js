// Simple email service stub used in local development.
// In production, integrate with a real provider (SendGrid, SES, EmailJS).

import { useLocalStorage, localDb } from '../firebase/config';

export const sendEmail = async ({ to, subject, text }) => {
  try {
    if (useLocalStorage) {
      // Persist emails in localDb to simulate sending and allow inspection
      localDb.collection('emails').add({ to, subject, text, createdAt: Date.now() });
      return { ok: true };
    }
    // TODO: Implement real email sending via backend or 3rd-party provider
    console.warn('Email sending not configured for production. Subject:', subject);
    return { ok: false, error: 'Email provider not configured' };
  } catch (e) {
    console.error('sendEmail error', e);
    return { ok: false, error: e?.message || 'Unknown error' };
  }
};

export const notifyAdminSignIn = async (user) => {
  const subject = 'User Sign-In Notification';
  const text = `User signed in: ${user?.email || 'unknown'} at ${new Date().toLocaleString()}`;
  // Default admin email(s). You can extend to multiple recipients.
  const adminEmail = 'marutleclint@gmail.com';
  return sendEmail({ to: adminEmail, subject, text });
};

export const sendVerificationCode = async (email, code) => {
  const subject = 'Your Verification Code';
  const text = `Your verification code is: ${code}. It expires in 15 minutes.`;
  return sendEmail({ to: email, subject, text });
};