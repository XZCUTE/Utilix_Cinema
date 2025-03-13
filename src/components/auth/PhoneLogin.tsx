import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Phone, ArrowRight, Loader, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuthContext } from "@/context/AuthContext";

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .regex(/^\+?[0-9\s\-\(\)]+$/, {
      message: "Please enter a valid phone number",
    }),
  verificationCode: z
    .string()
    .length(6, { message: "Verification code must be 6 digits" })
    .regex(/^[0-9]+$/, {
      message: "Verification code must contain only numbers",
    })
    .optional(),
});

interface PhoneLoginProps {
  onSuccess?: () => void;
}

const PhoneLogin = ({ onSuccess = () => {} }: PhoneLoginProps) => {
  const {
    loginWithPhone,
    verifyPhone,
    loading: authLoading,
    error: authError,
  } = useAuthContext();
  const [step, setStep] = useState<"phone" | "verification">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: "",
      verificationCode: "",
    },
  });

  const handleSendCode = async (data: z.infer<typeof phoneSchema>) => {
    try {
      setIsLoading(true);
      setPhoneError(null);
      setPhoneNumber(data.phoneNumber);

      // Use the loginWithPhone function from AuthContext
      const result = await loginWithPhone(data.phoneNumber);
      setConfirmationResult(result);
      setStep("verification");
      setVerificationSent(true);
    } catch (err) {
      console.error("Error sending verification code:", err);
      setPhoneError(
        err instanceof Error
          ? err.message
          : "Failed to send verification code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (data: z.infer<typeof phoneSchema>) => {
    try {
      setIsLoading(true);
      setPhoneError(null);

      if (!data.verificationCode) {
        throw new Error("Verification code is required");
      }

      // Use the verifyPhone function from AuthContext
      await verifyPhone(data.verificationCode);

      // Call success callback
      onSuccess();
    } catch (err) {
      console.error("Error verifying code:", err);
      setPhoneError(
        err instanceof Error
          ? err.message
          : "Invalid verification code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    try {
      setIsLoading(true);
      setPhoneError(null);

      // Use the loginWithPhone function from AuthContext to resend code
      const result = await loginWithPhone(phoneNumber);
      setConfirmationResult(result);
      setVerificationSent(true);
    } catch (err) {
      console.error("Error resending verification code:", err);
      setPhoneError(
        err instanceof Error
          ? err.message
          : "Failed to resend verification code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      {(phoneError || authError) && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {phoneError ||
              (authError instanceof Error
                ? authError.message
                : "An error occurred")}
          </AlertDescription>
        </Alert>
      )}

      {step === "verification" && verificationSent && (
        <Alert className="mb-4 bg-green-500/10 text-green-500 border-green-500/20">
          <AlertDescription>
            Verification code sent to {phoneNumber}. Please check your messages.
          </AlertDescription>
        </Alert>
      )}

      {/* reCAPTCHA container */}
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            step === "phone" ? handleSendCode : handleVerifyCode,
          )}
          className="space-y-4"
        >
          {step === "phone" ? (
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="+1 (555) 123-4567"
                        {...field}
                        className="pl-10"
                        disabled={isLoading || authLoading}
                      />
                    </FormControl>
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="verificationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123456"
                      {...field}
                      maxLength={6}
                      disabled={isLoading || authLoading}
                      className="text-center text-lg tracking-widest"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-between items-center">
            {step === "verification" && (
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("phone")}
                  className="text-sm"
                  disabled={isLoading || authLoading}
                >
                  Change Number
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resendVerificationCode}
                  className="text-sm text-primary"
                  disabled={isLoading || authLoading}
                >
                  Resend Code
                </Button>
              </div>
            )}

            <Button
              type="submit"
              className="ml-auto"
              disabled={isLoading || authLoading}
            >
              {isLoading || authLoading ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              {step === "phone" ? "Send Code" : "Verify"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PhoneLogin;
