import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TMDBContent } from "@shared/schema";
import { Link } from "wouter";

interface HeroSectionProps {
  content: TMDBContent;
}

export default function HeroSection({ content }: HeroSectionProps) {
  const backdropUrl = content.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${content.backdrop_path}`
    : null;

  const title = content.title || content.name;
  
  return (
    <div className="relative h-[60vh] w-full overflow-hidden">
      {backdropUrl && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="container mx-auto px-4 relative h-full flex items-center">
        <motion.div 
          className="max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {title}
          </h1>
          <p className="text-lg text-gray-200 mb-8">
            {content.overview}
          </p>
          <Link href={`/content/${content.id}`}>
            <Button size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              Watch Now
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
