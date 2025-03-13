import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroItem {
  id: string;
  title: string;
  description: string;
  backdropUrl: string;
  year: number;
  rating: string;
  genre: string;
  type: "movie" | "series";
}

interface HeroCarouselProps {
  items?: HeroItem[];
  autoPlayInterval?: number;
  onPlayClick?: (id: string) => void;
  onInfoClick?: (id: string) => void;
}

const HeroCarousel = ({
  items = [
    {
      id: "1",
      title: "Dune: Part Two",
      description:
        "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
      backdropUrl:
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=80",
      year: 2024,
      rating: "PG-13",
      genre: "Sci-Fi",
      type: "movie",
    },
    {
      id: "2",
      title: "The Last of Us",
      description:
        "After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity's last hope.",
      backdropUrl:
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80",
      year: 2023,
      rating: "TV-MA",
      genre: "Drama",
      type: "series",
    },
    {
      id: "3",
      title: "Oppenheimer",
      description:
        "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
      backdropUrl:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80",
      year: 2023,
      rating: "R",
      genre: "Biography",
      type: "movie",
    },
  ],
  autoPlayInterval = 6000,
  onPlayClick = () => {},
  onInfoClick = () => {},
}: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + items.length) % items.length,
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    // Pause autoplay temporarily when manually changing slides
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAutoPlaying) {
      interval = setInterval(() => {
        nextSlide();
      }, autoPlayInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlaying, autoPlayInterval]);

  const currentItem = items[currentIndex];

  return (
    <div className="relative w-full h-[500px] bg-black overflow-hidden">
      {/* Background Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
          <img
            src={currentItem.backdropUrl}
            alt={currentItem.title}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-16 max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm font-medium">
                {currentItem.type === "movie" ? "Movie" : "Series"}
              </Badge>
              <Badge
                variant="outline"
                className="text-sm font-medium bg-transparent border-white/20 text-white"
              >
                {currentItem.rating}
              </Badge>
              <span className="text-white/80 text-sm">{currentItem.year}</span>
              <span className="text-white/80 text-sm">•</span>
              <span className="text-white/80 text-sm">{currentItem.genre}</span>
            </div>

            <h1 className="text-5xl font-bold text-white tracking-tight">
              {currentItem.title}
            </h1>

            <p className="text-white/80 text-lg max-w-2xl">
              {currentItem.description}
            </p>

            <div className="flex gap-4 pt-4">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => onPlayClick(currentItem.id)}
              >
                <Play size={20} />
                Play Now
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 text-white hover:bg-black/50 rounded-full h-12 w-12"
        onClick={prevSlide}
      >
        <ChevronLeft size={24} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 text-white hover:bg-black/50 rounded-full h-12 w-12"
        onClick={nextSlide}
      >
        <ChevronRight size={24} />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentIndex ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
