import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Loader, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createQRSession,
  listenToQRSession
} from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";

interface QRCodeLoginProps {
  onSuccess?: () => void;
}

const QRCodeLogin = ({ onSuccess = () => {} }: QRCodeLoginProps) => {
  const [qrValue, setQrValue] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<
    "pending" | "scanned" | "authenticated"
  >("pending");
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Generate a new QR code session
  const generateQRSession = async () => {
    try {
      setLoading(true);
      setError(null);
      setScanStatus("pending");

      // Clean up any existing listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Create a new session
      const { sessionId: newSessionId } = await createQRSession();
      setSessionId(newSessionId);

      // Create a deep link URL that would open the app and pass the session ID
      const qrCodeValue = `https://utilixcinema.com/qr-login?session=${newSessionId}`;
      setQrValue(qrCodeValue);

      // Listen for changes to the session
      const unsubscribe = listenToQRSession(newSessionId, (status, userId) => {
        if (status === "scanned") {
          setScanStatus("scanned");
        } else if (status === "authenticated" && userId) {
          setScanStatus("authenticated");
          // Call the success callback after a brief delay
          setTimeout(() => onSuccess(), 1000);
        }
      });

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      console.error("Error generating QR session:", err);
      setError("Failed to generate QR code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Generate a QR code on component mount
  useEffect(() => {
    generateQRSession();

    // Clean up listener on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {scanStatus === "scanned" && (
        <Alert className="mb-4 bg-blue-500/10 text-blue-500 border-blue-500/20">
          <AlertDescription>
            QR code scanned! Waiting for authentication...
          </AlertDescription>
        </Alert>
      )}

      {scanStatus === "authenticated" && (
        <Alert className="mb-4 bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Authentication successful! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      <div className="relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[200px] w-[200px] bg-gray-800 rounded-lg">
            <Loader className="h-8 w-8 text-primary animate-spin" />
            <p className="mt-2 text-sm text-gray-400">Generating QR code...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[200px] w-[200px] bg-gray-800 rounded-lg">
            <p className="text-sm text-red-400 text-center mb-4">{error}</p>
            <Button onClick={generateQRSession} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : (
          <div className="p-4 bg-white rounded-lg">
            <QRCodeSVG value={qrValue} size={200} />
          </div>
        )}

        {scanStatus === "scanned" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              Scanning...
            </div>
          </div>
        )}

        {scanStatus === "authenticated" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 inline mr-1" />
              Authenticated
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-400 mt-4 text-center max-w-[250px]">
        Scan this QR code with your phone camera to log in instantly
      </p>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Open the Utilix Cinema mobile app and scan this code</p>
        <p>to log in securely without entering your password</p>
      </div>

      <Button
        onClick={generateQRSession}
        variant="ghost"
        size="sm"
        className="mt-4"
        disabled={
          loading || scanStatus === "scanned" || scanStatus === "authenticated"
        }
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Generate New Code
      </Button>
    </div>
  );
};

export default QRCodeLogin;
