import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar
        isAuthenticated={isAuthenticated}
        onLoginClick={() => {}}
        onSearchSubmit={(query) => navigate(`/search?q=${query}`)}
      />

      <main className="pt-[70px] pb-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg mb-6">
              At Utilix Cinema, we take your privacy seriously. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our service.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Information We Collect
            </h2>
            <p>
              We collect information that you provide directly to us when you:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Create an account</li>
              <li>Use our services</li>
              <li>Contact customer support</li>
              <li>Participate in surveys or promotions</li>
            </ul>
            <p className="mt-4">
              This information may include your name, email address, phone
              number, and profile information. We also collect information about
              your usage of the service, including your viewing history,
              preferences, and interactions with the platform.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>
                Send you technical notices, updates, security alerts, and
                support messages
              </li>
              <li>
                Respond to your comments, questions, and customer service
                requests
              </li>
              <li>
                Personalize your experience and deliver content and product
                offerings relevant to your interests
              </li>
              <li>
                Monitor and analyze trends, usage, and activities in connection
                with our services
              </li>
              <li>
                Detect, investigate, and prevent fraudulent transactions and
                other illegal activities
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Sharing of Information
            </h2>
            <p>
              We may share information about you as follows or as otherwise
              described in this Privacy Policy:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                With vendors, consultants, and other service providers who need
                access to such information to carry out work on our behalf
              </li>
              <li>
                In response to a request for information if we believe
                disclosure is in accordance with any applicable law, regulation,
                or legal process
              </li>
              <li>
                If we believe your actions are inconsistent with our user
                agreements or policies, or to protect the rights, property, and
                safety of Utilix Cinema or others
              </li>
              <li>
                In connection with, or during negotiations of, any merger, sale
                of company assets, financing, or acquisition of all or a portion
                of our business by another company
              </li>
              <li>With your consent or at your direction</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
            <p>
              We take reasonable measures to help protect information about you
              from loss, theft, misuse, unauthorized access, disclosure,
              alteration, and destruction. However, no security system is
              impenetrable, and we cannot guarantee the security of our systems.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Your Choices</h2>
            <p>
              You can access and update certain information about yourself from
              within your account settings. You can also request that we delete
              your account and personal information by contacting us.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Changes to this Policy
            </h2>
            <p>
              We may change this Privacy Policy from time to time. If we make
              changes, we will notify you by revising the date at the top of the
              policy and, in some cases, we may provide you with additional
              notice.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at:
            </p>
            <p className="mt-2">
              Email: privacy@utilixcinema.com
              <br />
              Address: 123 Streaming Avenue, Suite 456, San Francisco, CA 94103,
              United States
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
