import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Loader, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { sendLoginEmail } from "@/lib/firebase";

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

interface EmailLinkLoginProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

const EmailLinkLogin = ({ onSuccess = () => {}, onBack = () => {} }: EmailLinkLoginProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof emailSchema>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Define the action code settings
      const actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: window.location.origin + '/auth/email-signin',
        // This must be true.
        handleCodeInApp: true,
      };

      // Send sign-in link to the user's email
      await sendLoginEmail(data.email, actionCodeSettings);
      
      setSuccess(true);
    } catch (err) {
      console.error("Email link login error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send login link. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-md">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h3 className="font-medium">Login Link Sent</h3>
          <p className="text-sm mt-2">
            We've sent a login link to your email address. Please check your inbox
            and click the link to sign in.
          </p>
        </div>

        <Button variant="outline" className="mt-4" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login Options
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <p className="text-sm text-muted-foreground mb-4">
        Enter your email address below to receive a sign-in link. No password needed!
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="your.email@example.com"
                      type="email"
                      {...field}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-start">
            <Button
              variant="link"
              className="px-0 text-sm"
              type="button"
              disabled={isSubmitting}
              onClick={onBack}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Login Options
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Sending Login Link...
              </>
            ) : (
              "Send Login Link"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EmailLinkLogin; 