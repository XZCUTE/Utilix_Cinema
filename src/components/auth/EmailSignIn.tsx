import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { completeEmailSignIn } from '@/lib/firebase';
import { useAuthContext } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EmailSignIn = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmailLink = async () => {
      try {
        // Get the full URL
        const url = window.location.href;
        
        // Process the email sign-in link
        const user = await completeEmailSignIn(url);
        
        if (user) {
          setSuccess(true);
          // Wait 1.5 seconds before redirecting
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          setError('Invalid or expired sign-in link.');
        }
      } catch (err) {
        console.error('Error signing in with email link:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to sign in with email link.'
        );
      } finally {
        setIsProcessing(false);
      }
    };

    // If the user is already authenticated, redirect to home
    if (isAuthenticated) {
      window.location.href = '/';
      return;
    }

    verifyEmailLink();
  }, [isAuthenticated]);

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-6 bg-background border rounded-lg shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            <Loader className="h-10 w-10 text-primary animate-spin" />
            <h1 className="text-2xl font-bold">Signing you in...</h1>
            <p className="text-center text-muted-foreground">
              Please wait while we verify your sign-in link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-6 bg-background border rounded-lg shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <p className="text-center text-muted-foreground">
              Please try again or use another sign-in method.
            </p>
            <a
              href="/login"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Return to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-6 bg-background border rounded-lg shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <h1 className="text-2xl font-bold">Successfully Signed In!</h1>
            <p className="text-center text-muted-foreground">
              You are now signed in. Redirecting to the home page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback - should not usually get here
  return <Navigate to="/" />;
};

export default EmailSignIn; 