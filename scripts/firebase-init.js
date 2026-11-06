import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, doc, query, where, orderBy, limit, onSnapshot,
  addDoc, getDoc, getDocs, runTransaction } from 'firebase/firestore';

const app = initializeApp(window.firebaseConfig);
// Keep the existing project's Datastore database separate from this Native database.
window.F = {
  app, auth: getAuth(app), db: getFirestore(app, 'friendlyeats'),
  signInAnonymously, collection, doc, query, where, orderBy, limit, onSnapshot,
  addDoc, getDoc, getDocs, runTransaction
};
