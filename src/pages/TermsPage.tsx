import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const TermsPage = () => {
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
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg mb-6">
              Welcome to Utilix Cinema. By accessing or using our service, you
              agree to be bound by these Terms of Service. Please read them
              carefully.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Utilix Cinema, you agree to be bound by
              these Terms of Service and all applicable laws and regulations. If
              you do not agree with any of these terms, you are prohibited from
              using or accessing this site.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily access the materials on
              Utilix Cinema for personal, non-commercial viewing only. This is
              the grant of a license, not a transfer of title, and under this
              license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Modify or copy the materials</li>
              <li>
                Use the materials for any commercial purpose or for any public
                display
              </li>
              <li>
                Attempt to reverse engineer any software contained on Utilix
                Cinema
              </li>
              <li>
                Remove any copyright or other proprietary notations from the
                materials
              </li>
              <li>
                Transfer the materials to another person or "mirror" the
                materials on any other server
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              3. Account Registration
            </h2>
            <p>
              To access certain features of Utilix Cinema, you may be required
              to register for an account. You agree to provide accurate,
              current, and complete information during the registration process
              and to update such information to keep it accurate, current, and
              complete.
            </p>
            <p className="mt-4">
              You are responsible for safeguarding the password that you use to
              access Utilix Cinema and for any activities or actions under your
              password. We encourage you to use "strong" passwords (passwords
              that use a combination of upper and lower case letters, numbers,
              and symbols) with your account.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Content</h2>
            <p>
              Utilix Cinema does not host any content directly. We aggregate
              metadata and provide links to content hosted on third-party
              platforms. We do not guarantee the accuracy, completeness, or
              quality of any content accessed through our service.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Disclaimer</h2>
            <p>
              The materials on Utilix Cinema are provided on an "as is" basis.
              Utilix Cinema makes no warranties, expressed or implied, and
              hereby disclaims and negates all other warranties including,
              without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or
              non-infringement of intellectual property or other violation of
              rights.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Limitations</h2>
            <p>
              In no event shall Utilix Cinema or its suppliers be liable for any
              damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use the materials on Utilix Cinema, even if Utilix
              Cinema or a Utilix Cinema authorized representative has been
              notified orally or in writing of the possibility of such damage.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              7. Revisions and Errata
            </h2>
            <p>
              The materials appearing on Utilix Cinema could include technical,
              typographical, or photographic errors. Utilix Cinema does not
              warrant that any of the materials on its website are accurate,
              complete, or current. Utilix Cinema may make changes to the
              materials contained on its website at any time without notice.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Links</h2>
            <p>
              Utilix Cinema has not reviewed all of the sites linked to its
              website and is not responsible for the contents of any such linked
              site. The inclusion of any link does not imply endorsement by
              Utilix Cinema of the site. Use of any such linked website is at
              the user&apos;s own risk.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              9. Modifications to Terms of Service
            </h2>
            <p>
              Utilix Cinema may revise these terms of service for its website at
              any time without notice. By using this website you are agreeing to
              be bound by the then current version of these terms of service.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              10. Governing Law
            </h2>
            <p>
              These terms and conditions are governed by and construed in
              accordance with the laws of the United States and you irrevocably
              submit to the exclusive jurisdiction of the courts in that
              location.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please
              contact us at:
            </p>
            <p className="mt-2">
              Email: terms@utilixcinema.com
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

export default TermsPage;
