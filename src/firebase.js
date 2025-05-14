import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Error handling utility
const handleFirebaseError = (error) => {
  console.error('Firebase Error:', error);
  
  switch (error.code) {
    case 'permission-denied':
      return 'Bu işlem için yetkiniz yok';
    case 'not-found':
      return 'İstenen kaynak bulunamadı';
    case 'already-exists':
      return 'Bu kaynak zaten mevcut';
    case 'resource-exhausted':
      return 'İstek limiti aşıldı, lütfen daha sonra tekrar deneyin';
    case 'failed-precondition':
      return 'İşlem ön koşulları karşılanmadı';
    case 'aborted':
      return 'İşlem iptal edildi';
    case 'out-of-range':
      return 'İstek aralık dışında';
    case 'unimplemented':
      return 'Bu özellik henüz uygulanmadı';
    case 'internal':
      return 'Sunucu hatası, lütfen daha sonra tekrar deneyin';
    case 'unavailable':
      return 'Servis şu anda kullanılamıyor, lütfen daha sonra tekrar deneyin';
    case 'data-loss':
      return 'Veri kaybı oluştu';
    case 'unauthenticated':
      return 'Oturum açmanız gerekiyor';
    default:
      return 'Bir hata oluştu, lütfen daha sonra tekrar deneyin';
  }
};

const firebaseConfig = {
  apiKey: "AIzaSyBbqiruaR7Q40hg-BNHHYhz60iBjboY3ts",
  authDomain: "realtalk-1e857.firebaseapp.com",
  projectId: "realtalk-1e857",
  storageBucket: "realtalk-1e857.firebasestorage.app",
  messagingSenderId: "308550468075",
  appId: "1:308550468075:web:df1a0a7284bd92f2f359ae",
  measurementId: "G-K98HVWL069"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Doğru offline persistence:
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });

// Custom hooks and utilities
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

export { handleFirebaseError };
export default app; 