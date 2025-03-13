import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Github, Facebook, Instagram } from "lucide-react";

interface FooterProps {}

const Footer = ({}: FooterProps) => {
  const footerLinks = [
    { title: "About", href: "/about" },
    { title: "Terms of Service", href: "/terms" },
    { title: "Privacy Policy", href: "/privacy" },
    { title: "FAQ", href: "/faq" },
    { title: "Contact", href: "/contact" },
  ];

  const socialLinks = [
    {
      icon: <Github size={18} />,
      label: "GitHub",
      href: "https://github.com/XZCUTE",
    },
    {
      icon: <Facebook size={18} />,
      label: "Facebook",
      href: "https://www.facebook.com/mark.starosa.18",
    },
    {
      icon: <Instagram size={18} />,
      label: "Instagram",
      href: "https://www.instagram.com/marksta.rosa/",
    },
  ];

  return (
    <footer className="w-full bg-card text-card-foreground py-6 px-4 md:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">Utilix Cinema</h2>
            <p className="text-sm text-muted-foreground">
              Your premium streaming experience
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {socialLinks.map((social, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={social.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.icon}
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{social.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 mb-4 md:mb-0">
            {footerLinks.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Utilix Cinema. All rights reserved.
          </div>
        </div>

        <div className="mt-6 text-xs text-muted-foreground text-center">
          <p>
            This is a demonstration project designed to showcase functionality.
            Our website does not host or store any data or media files on our
            servers.
          </p>
          <p>
            Instead, it aggregates content from third-party sources, providing
            links to media hosted externally.
          </p>
          <p>
            We do not claim ownership or responsibility for the content provided
            by these third-party services.
          </p>
          <p>
            This platform is for educational purposes only. All content is
            sourced from third-party providers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
