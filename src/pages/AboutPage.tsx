import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const AboutPage = () => {
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
          <h1 className="text-3xl font-bold mb-6">About Utilix Cinema</h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg mb-6">
              Utilix Cinema is a modern streaming platform designed to provide
              users with a seamless and enjoyable viewing experience. Our
              platform aggregates content from various sources, allowing you to
              discover and watch your favorite movies and TV shows all in one
              place.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
            <p>
              Our mission is to create a user-friendly platform that makes it
              easy to discover, organize, and enjoy digital content. We believe
              in providing a personalized experience that adapts to your
              preferences and viewing habits.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Features</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Extensive library of movies and TV shows</li>
              <li>
                Personalized recommendations based on your viewing history
              </li>
              <li>Create and manage your own library of favorite content</li>
              <li>
                Watch together feature for synchronized viewing with friends
              </li>
              <li>Multiple theme options to customize your experience</li>
              <li>Responsive design that works on all your devices</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Content Sources
            </h2>
            <p>
              Utilix Cinema aggregates metadata from The Movie Database (TMDB)
              to provide comprehensive information about movies and TV shows.
              Our platform does not host any content directly but provides links
              to legitimate streaming sources where available.
            </p>
            <p className="mt-4">
              We respect intellectual property rights and only link to content
              that is legally available for streaming. If you believe any
              content linked through our platform infringes on copyright, please
              contact us immediately.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Technology</h2>
            <p>
              Utilix Cinema is built using modern web technologies including
              React, TypeScript, and Tailwind CSS. We leverage Firebase for
              authentication, real-time database functionality, and storage to
              provide a seamless and responsive user experience.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions, feedback, or concerns about Utilix
              Cinema, please visit our{" "}
              <a href="/contact" className="text-primary hover:underline">
                Contact page
              </a>{" "}
              to get in touch with our team.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
