import React from "react";
import { Coffee, Heart, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";

const DonationPage = () => {
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    alert(`${type} copied to clipboard!`);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
            <Coffee className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            Support My Work – Buy Me a Coffee
            <span className="inline-flex">☕💖</span>
          </h1>
          
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm mb-8">
            <p className="text-lg mb-4">
              Your support means the world to me! If you enjoy what I create and find 
              value in my work, consider buying me a coffee or making a donation. 
              Every contribution helps me continue doing what I love, improve my projects, 
              and bring you even more great content.
            </p>
            <p className="text-lg">
              Your generosity keeps this journey going, and I truly appreciate every bit of support. 
              Thank you for being amazing! 
              <Heart className="inline-block h-5 w-5 ml-1 fill-primary text-primary" />
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PayPal Section */}
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png"
                  alt="PayPal"
                  className="h-8 mr-3"
                />
                <h2 className="text-2xl font-semibold">PayPal</h2>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Send your donation directly to my PayPal account. 
                Quick, easy, and secure!
              </p>
              
              <div className="bg-background p-4 rounded-md mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">marktstarosa838@gmail.com</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopy("marktstarosa838@gmail.com", "PayPal email")}
                    className="ml-2"
                  >
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                </div>
              </div>
              
              <a 
                href="https://www.paypal.com/myaccount/transfer/homepage" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <Button className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" /> Go to PayPal
                </Button>
              </a>
            </div>
          </div>

          {/* GCash Section */}
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center bg-blue-500 text-white h-8 w-8 rounded-full mr-3 font-bold">
                  G
                </div>
                <h2 className="text-2xl font-semibold">GCash</h2>
              </div>
              
              <p className="text-muted-foreground mb-4">
                If you're in the Philippines, you can send your donation through GCash.
                Fast and convenient!
              </p>
              
              <div className="bg-background p-4 rounded-md mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">09912159697</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopy("09912159697", "GCash number")}
                    className="ml-2"
                  >
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                </div>
              </div>
              
              <a 
                href="https://www.gcash.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <Button className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" /> Go to GCash
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg mb-4">
            Every donation, no matter how small, makes a huge difference and motivates me to create even better content.
          </p>
          <p className="text-lg font-medium">
            Thank you for your incredible support! 
            <Heart className="inline-block h-5 w-5 mx-1 fill-primary text-primary" />
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default DonationPage; 