import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: "What is Utilix Cinema?",
      answer:
        "Utilix Cinema is a streaming platform that aggregates content from various sources, allowing you to discover and watch your favorite movies and TV shows all in one place.",
      category: "general",
    },
    {
      question: "Is Utilix Cinema free to use?",
      answer:
        "Utilix Cinema offers both free and premium tiers. The free tier provides access to a limited library with ads, while the premium subscription offers an ad-free experience with access to our full content library.",
      category: "billing",
    },
    {
      question: "How do I create an account?",
      answer:
        "You can create an account by clicking the 'Login' button in the top right corner of the page and then selecting 'Sign Up'. You can register using your email, Google account, or phone number.",
      category: "account",
    },
    {
      question: "Can I watch content offline?",
      answer:
        "Premium subscribers can download select movies and TV shows for offline viewing on mobile devices. This feature is not available for all content due to licensing restrictions.",
      category: "features",
    },
    {
      question: "How do I cancel my subscription?",
      answer:
        "You can cancel your subscription at any time by going to your Account Settings and selecting 'Subscription'. From there, click on 'Cancel Subscription' and follow the prompts.",
      category: "billing",
    },
    {
      question: "What devices can I use to watch Utilix Cinema?",
      answer:
        "Utilix Cinema is available on web browsers, iOS and Android devices, smart TVs, streaming devices (like Roku and Fire TV), and gaming consoles.",
      category: "technical",
    },
    {
      question: "How many devices can I stream on simultaneously?",
      answer:
        "The number of simultaneous streams depends on your subscription plan. Basic plans allow 1 stream, Standard plans allow 2 streams, and Premium plans allow up to 4 streams at once.",
      category: "account",
    },
    {
      question: "What is the 'Watch Together' feature?",
      answer:
        "'Watch Together' allows you to create a virtual watch room where you and your friends can watch the same content simultaneously while chatting. The host controls playback for everyone in the room.",
      category: "features",
    },
    {
      question: "How do I add content to my library?",
      answer:
        "You can add content to your library by clicking the '+' button on any movie or TV show card, or by clicking the 'Add to Library' button on the content details page.",
      category: "features",
    },
    {
      question: "Does Utilix Cinema create its own content?",
      answer:
        "No, Utilix Cinema is a content aggregator that provides access to movies and TV shows from various sources. We do not produce original content at this time.",
      category: "general",
    },
    {
      question: "How do I report a technical issue?",
      answer:
        "You can report technical issues by visiting our Contact page and submitting a support ticket. Please include as much detail as possible, including the device you're using and steps to reproduce the issue.",
      category: "technical",
    },
    {
      question: "Can I share my account with others?",
      answer:
        "While our terms of service allow for family sharing within a household, sharing your account credentials with people outside your household is against our terms of service.",
      category: "account",
    },
  ];

  const categories = [
    { id: "general", name: "General" },
    { id: "account", name: "Account" },
    { id: "billing", name: "Billing" },
    { id: "features", name: "Features" },
    { id: "technical", name: "Technical" },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredFAQs = faqItems.filter((item) => {
    const matchesSearch = searchQuery
      ? item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory = activeCategory
      ? item.category === activeCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar
        isAuthenticated={isAuthenticated}
        onLoginClick={() => {}}
        onSearchSubmit={(query) => navigate(`/search?q=${query}`)}
      />

      <main className="pt-[70px] pb-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 mb-8">
            Find answers to common questions about Utilix Cinema
          </p>

          {/* Search */}
          <div className="relative mb-8">
            <Input
              type="search"
              placeholder="Search for questions..."
              className="bg-gray-800 border-gray-700 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full text-left p-4 flex justify-between items-center bg-gray-800 hover:bg-gray-700 transition-colors"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="font-medium">{faq.question}</span>
                    {expandedIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedIndex === index && (
                    <div className="p-4 bg-gray-900 border-t border-gray-700">
                      <p className="text-gray-300">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-800 rounded-lg">
                <p className="text-gray-400">
                  No results found for your search.
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory(null);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>

          {/* Still need help */}
          <div className="mt-12 bg-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">Still need help?</h2>
            <p className="text-gray-400 mb-4">
              If you couldn't find the answer to your question, our support team
              is here to help.
            </p>
            <Button onClick={() => navigate("/contact")}>
              Contact Support
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
