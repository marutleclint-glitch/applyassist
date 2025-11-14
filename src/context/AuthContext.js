import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useLocalStorage, localDb } from '../firebase/config';
import { notifyAdminSignIn, sendVerificationCode } from '../services/emailService';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Register a new user
  const register = async (email, password, displayName, role = 'applicant') => {
    if (useLocalStorage) {
      try {
        setError('');
        const existing = localDb.collection('users').where('email', '==', email).get().docs;
        if (existing && existing.length > 0) {
          throw new Error('Email already in use');
        }
        const { id } = localDb.collection('users').add({
          uid: '',
          email,
          name: displayName,
          displayName,
          role,
          password,
          isVerified: false,
          createdAt: new Date().toISOString()
        });
        localDb.collection('users').doc(id).update({ uid: id });
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 15 * 60 * 1000;
        localDb.collection('verifications').add({ email, userId: id, code, expiresAt });
        await sendVerificationCode(email, code);
        // Do not auto-login; require verification
        return { uid: id, email, displayName, role, isVerified: false };
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    try {
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: displayName });
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName,
        role,
        createdAt: new Date().toISOString()
      });
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    if (useLocalStorage) {
      try {
        setError('');
        const docs = localDb.collection('users').where('email', '==', email).get().docs;
        if (!docs || docs.length === 0) {
          throw new Error('User not found');
        }
        const data = docs[0].data();
        if (data.password !== password) {
          throw new Error('Invalid password');
        }
        if (data.isVerified !== true) {
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = Date.now() + 15 * 60 * 1000;
          localDb.collection('verifications').add({ email, userId: data.uid, code, expiresAt });
          await sendVerificationCode(email, code);
          throw new Error('Email verification required');
        }
        const user = { uid: data.uid, email: data.email, displayName: data.displayName || data.name, role: data.role };
        localStorage.setItem('applyAssistMockCurrentUser', JSON.stringify(user));
        setCurrentUser(user);
        await notifyAdminSignIn(user);
        return user;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await notifyAdminSignIn(user);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout user
  const logout = async () => {
    if (useLocalStorage) {
      try {
        setError('');
        localStorage.removeItem('applyAssistMockCurrentUser');
        setCurrentUser(null);
      } catch (err) {
        setError(err.message);
        throw err;
      }
      return;
    }
    try {
      setError('');
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    if (useLocalStorage) {
      setError('Password reset is not available in local mode');
      return;
    }
    try {
      setError('');
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  // Update user profile
  const updateUserProfile = async (userData) => {
    if (useLocalStorage) {
      try {
        setError('');
        const user = currentUser;
        if (!user) throw new Error('No user is currently logged in');
        localDb.collection('users').doc(user.uid).update({
          ...userData,
          updatedAt: new Date().toISOString()
        });
        const updatedDoc = localDb.collection('users').doc(user.uid).get();
        const updatedData = updatedDoc.data();
        setCurrentUser({ ...user, ...updatedData });
        return true;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    try {
      setError('');
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently logged in');
      }
      if (userData.displayName) {
        await updateProfile(user, { displayName: userData.displayName });
      }
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { ...userData, updatedAt: new Date().toISOString() });
      const updatedUserDoc = await getDoc(userRef);
      if (updatedUserDoc.exists()) {
        setCurrentUser({ ...user, ...updatedUserDoc.data() });
      }
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update user email
  const updateUserEmail = async (newEmail, password) => {
    if (useLocalStorage) {
      try {
        setError('');
        const user = currentUser;
        if (!user) throw new Error('No user is currently logged in');
        localDb.collection('users').doc(user.uid).update({
          email: newEmail,
          updatedAt: new Date().toISOString()
        });
        const updatedDoc = localDb.collection('users').doc(user.uid).get();
        const updatedData = updatedDoc.data();
        setCurrentUser({ ...user, ...updatedData });
        return true;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    try {
      setError('');
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently logged in');
      }
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, newEmail);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { email: newEmail, updatedAt: new Date().toISOString() });
      const updatedUserDoc = await getDoc(userRef);
      if (updatedUserDoc.exists()) {
        setCurrentUser({ ...user, ...updatedUserDoc.data() });
      }
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update user password
  const updateUserPassword = async (newPassword, currentPassword) => {
    if (useLocalStorage) {
      try {
        setError('');
        const user = currentUser;
        if (!user) throw new Error('No user is currently logged in');
        // Simple check (no re-auth in local mode)
        localDb.collection('users').doc(user.uid).update({
          password: newPassword,
          updatedAt: new Date().toISOString()
        });
        return true;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    try {
      setError('');
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently logged in');
      }
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get user role from Firestore or local
  const getUserRole = async (uid) => {
    if (useLocalStorage) {
      try {
        const docData = localDb.collection('users').doc(uid).get();
        if (docData && docData.exists) {
          const data = docData.data();
          return data.role || null;
        }
        return null;
      } catch (err) {
        console.error('Error getting user role:', err);
        return null;
      }
    }
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data().role;
      }
      return null;
    } catch (err) {
      console.error("Error getting user role:", err);
      return null;
    }
  };
  
  // Update user role
  const updateUserRole = async (uid, newRole) => {
    if (useLocalStorage) {
      try {
        localDb.collection('users').doc(uid).update({ role: newRole });
        if (currentUser && currentUser.uid === uid) {
          setCurrentUser({ ...currentUser, role: newRole });
        }
        return true;
      } catch (err) {
        console.error('Error updating user role:', err);
        return false;
      }
    }
    try {
      await setDoc(doc(db, 'users', uid), { role: newRole }, { merge: true });
      if (currentUser && currentUser.uid === uid) {
        setCurrentUser({ ...currentUser, role: newRole });
      }
      return true;
    } catch (err) {
      console.error('Error updating user role:', err);
      return false;
    }
  };

  // Get all users (admin function)
  const getAllUsers = async () => {
    if (useLocalStorage) {
      try {
        const querySnapshot = localDb.collection('users').get();
        const users = querySnapshot.docs.map(d => {
          const data = d.data();
          return {
            id: data.uid || d.id,
            name: data.name || data.displayName || 'Unknown',
            email: data.email,
            role: data.role || 'applicant',
            createdAt: data.createdAt || new Date().toISOString()
          };
        });
        return users;
      } catch (err) {
        console.error('Error getting users:', err);
        return [];
      }
    }
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      return users;
    } catch (err) {
      console.error('Error getting users:', err);
      return [];
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return currentUser && currentUser.role === 'admin';
  };

  // Listen for auth state changes or local session
  useEffect(() => {
    if (useLocalStorage) {
      // Seed a default admin if none exists
      const usersDocs = localDb.collection('users').get().docs;
      const hasAdmin = usersDocs.some(d => (d.data().role === 'admin'));
      if (!hasAdmin) {
        const { id } = localDb.collection('users').add({
          uid: '',
          email: 'marutleclint@gmail.com',
          name: 'Admin',
          displayName: 'Admin',
          role: 'admin',
          password: 'Admin123!',
          isVerified: true,
          createdAt: new Date().toISOString()
        });
        localDb.collection('users').doc(id).update({ uid: id });
      }
      const saved = localStorage.getItem('applyAssistMockCurrentUser');
      if (saved) {
        try {
          const user = JSON.parse(saved);
          setCurrentUser(user);
        } catch (e) {
          localStorage.removeItem('applyAssistMockCurrentUser');
          setCurrentUser(null);
        }
      } else {
        // Disable any automatic admin login in production/local mode; require explicit login
        setCurrentUser(null);
      }
      setLoading(false);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({ ...user, role: userData.role });
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    resetPassword,
    getUserRole,
    updateUserRole,
    getAllUsers,
    isAdmin,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};