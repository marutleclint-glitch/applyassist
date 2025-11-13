import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For development purposes, we're using a placeholder config
// Replace with actual Firebase config in production
const firebaseConfig = {
  apiKey: "AIzaSyApplyAssistDemoKey123456789",
  authDomain: "apply-assist-demo.firebaseapp.com",
  projectId: "apply-assist-demo",
  storageBucket: "apply-assist-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// For local development without Firebase, we'll use localStorage
const useLocalStorage = true; // Set to false when using real Firebase

// Helper functions for local storage
const localDb = {
  collections: {},
  
  // Initialize collections
  init() {
    const savedData = localStorage.getItem('applyAssistData');
    if (savedData) {
      this.collections = JSON.parse(savedData);
    } else {
      // Create default collections
      this.collections = {
        users: [],
        orders: [],
        chats: [],
        files: []
      };
      this.save();
    }
    return this;
  },
  
  // Save data to localStorage
  save() {
    localStorage.setItem('applyAssistData', JSON.stringify(this.collections));
    return this;
  },
  
  // Get collection
  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = [];
      this.save();
    }
    return {
      add: (data) => {
        const id = Date.now().toString();
        const newDoc = { id, ...data, createdAt: new Date().toISOString() };
        this.collections[name].push(newDoc);
        this.save();
        return { id };
      },
      get: () => {
        return {
          docs: this.collections[name].map(doc => ({
            id: doc.id,
            data: () => ({ ...doc })
          }))
        };
      },
      doc: (id) => {
        return {
          get: () => {
            const doc = this.collections[name].find(d => d.id === id);
            return {
              exists: !!doc,
              data: () => doc ? { ...doc } : null
            };
          },
          set: (data) => {
            const index = this.collections[name].findIndex(d => d.id === id);
            if (index >= 0) {
              this.collections[name][index] = { ...this.collections[name][index], ...data };
            } else {
              this.collections[name].push({ id, ...data });
            }
            this.save();
          },
          update: (data) => {
            const index = this.collections[name].findIndex(d => d.id === id);
            if (index >= 0) {
              this.collections[name][index] = { ...this.collections[name][index], ...data };
              this.save();
            }
          },
          delete: () => {
            const index = this.collections[name].findIndex(d => d.id === id);
            if (index >= 0) {
              this.collections[name].splice(index, 1);
              this.save();
            }
          }
        };
      },
      where: (field, operator, value) => {
        return {
          get: () => {
            let filteredDocs = [...this.collections[name]];
            
            if (operator === '==') {
              filteredDocs = filteredDocs.filter(doc => doc[field] === value);
            } else if (operator === '!=') {
              filteredDocs = filteredDocs.filter(doc => doc[field] !== value);
            }
            
            return {
              docs: filteredDocs.map(doc => ({
                id: doc.id,
                data: () => ({ ...doc })
              }))
            };
          }
        };
      }
    };
  }
};

// Initialize local storage database
const localDbInstance = localDb.init();

export { auth, db, storage, useLocalStorage, localDbInstance as localDb };