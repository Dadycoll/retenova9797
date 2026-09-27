import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  updateDoc,
  deleteDoc, 
  collection, 
  query, 
  where,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ScreeningRecord, Booking } from '../types';

export const ADMIN_EMAILS = [
  'shauryavikramsingh02@gmail.com',
  'sshauryavikram@gmail.com'
];

export function isUserAdmin(user: User | null | undefined): boolean {
  if (!user || !user.email) return false;
  const lower = user.email.toLowerCase().trim();
  return ADMIN_EMAILS.some(e => e.toLowerCase() === lower);
}


// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with the required database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Error Handling Infrastructure
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: Client currently offline or initializing.');
    }
    return false;
  }
}

// User Profile sync
export async function syncUserProfile(user: User): Promise<void> {
  const userPath = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || 'anonymous@clinic.local',
        displayName: user.displayName || user.email?.split('@')[0] || 'Clinician',
        role: 'clinician',
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

// Save screening record to Firestore
export async function saveScreeningToFirestore(record: ScreeningRecord, userId: string): Promise<void> {
  const docId = record.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `screenings/${docId}`;
  try {
    const docRef = doc(db, 'screenings', docId);
    await setDoc(docRef, {
      id: docId,
      userId: userId,
      patientName: record.patient.name,
      patientNumber: record.patient.patientNumber,
      examDate: record.patient.examDate,
      overallCategory: record.overallCategory,
      recordData: JSON.stringify(record),
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Load screening records from Firestore for current user
export async function loadScreeningsFromFirestore(userId: string): Promise<ScreeningRecord[]> {
  const path = 'screenings';
  try {
    const q = query(
      collection(db, 'screenings'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const records: ScreeningRecord[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.recordData) {
        try {
          const parsed = JSON.parse(data.recordData) as ScreeningRecord;
          records.push(parsed);
        } catch (e) {
          console.error('Failed to parse recordData for', d.id, e);
        }
      }
    });
    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Delete screening record from Firestore
export async function deleteScreeningFromFirestore(recordId: string, userId: string): Promise<void> {
  const docId = recordId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `screenings/${docId}`;
  try {
    const docRef = doc(db, 'screenings', docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Admin: Load all screenings across all users
export async function loadAllScreeningsForAdmin(): Promise<ScreeningRecord[]> {
  if (!isUserAdmin(auth.currentUser)) {
    return [];
  }
  const path = 'screenings';
  try {
    const q = collection(db, 'screenings');
    const snap = await getDocs(q);
    const records: ScreeningRecord[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.recordData) {
        try {
          const parsed = JSON.parse(data.recordData) as ScreeningRecord;
          records.push(parsed);
        } catch (e) {
          console.error('Failed to parse recordData for', d.id, e);
        }
      }
    });
    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Bookings collection helpers
export async function saveBookingToFirestore(booking: Booking): Promise<void> {
  if (!isUserAdmin(auth.currentUser)) {
    return;
  }
  const docId = booking.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `bookings/${docId}`;
  try {
    const docRef = doc(db, 'bookings', docId);
    await setDoc(docRef, {
      ...booking,
      id: docId,
      createdAt: booking.createdAt || new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadBookingsFromFirestore(): Promise<Booking[]> {
  if (!isUserAdmin(auth.currentUser)) {
    return [];
  }
  const path = 'bookings';
  try {
    const colRef = collection(db, 'bookings');
    const snap = await getDocs(colRef);
    const bookings: Booking[] = [];
    snap.forEach((d) => {
      bookings.push(d.data() as Booking);
    });
    return bookings;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function updateBookingStatusInFirestore(bookingId: string, status: Booking['status']): Promise<void> {
  if (!isUserAdmin(auth.currentUser)) {
    return;
  }
  const docId = bookingId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `bookings/${docId}`;
  try {
    const docRef = doc(db, 'bookings', docId);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteBookingFromFirestore(bookingId: string): Promise<void> {
  if (!isUserAdmin(auth.currentUser)) {
    return;
  }
  const docId = bookingId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `bookings/${docId}`;
  try {
    const docRef = doc(db, 'bookings', docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Auth methods
export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};

