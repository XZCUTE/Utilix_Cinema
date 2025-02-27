import { motion } from "framer-motion";
import { Link } from "wouter";
import type { TMDBContent } from "@shared/schema";

interface ContentGridProps {
  title: string;
  items: TMDBContent[];
}

export default function ContentGrid({ title, items }: ContentGridProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((item, index) => (
          <Link key={item.id} href={`/content/${item.id}`}>
            <motion.div
              className="relative aspect-[2/3] rounded-md overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {item.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title || item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 p-4">
                  <h3 className="text-sm font-medium line-clamp-2">
                    {item.title || item.name}
                  </h3>
                  <p className="text-xs text-gray-300 mt-1">
                    {new Date(item.release_date || item.first_air_date || "").getFullYear()}
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
