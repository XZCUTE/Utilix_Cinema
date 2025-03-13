import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isConnectedToFirebase, setIsConnectedToFirebase] = useState<boolean | null>(null);

  // Monitor browser online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor Firebase connection status
  useEffect(() => {
    const connectedRef = ref(database, '.info/connected');
    
    const unsubscribe = onValue(connectedRef, (snap) => {
      setIsConnectedToFirebase(snap.val() === true);
    });

    return () => unsubscribe();
  }, []);

  return {
    isOnline,                // Browser reports online status
    isConnectedToFirebase,   // Firebase specific connection status
    isFullyConnected: isOnline && isConnectedToFirebase === true
  };
}; 