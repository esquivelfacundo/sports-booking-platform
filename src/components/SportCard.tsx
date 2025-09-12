'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface Sport {
  id: number;
  name: string;
  icon: string;
  color: string;
  facilities: number;
  image?: string;
}

interface SportCardProps {
  sport: Sport;
}

const SportCard = ({ sport }: SportCardProps) => {
  const handleClick = () => {
    // TODO: Navigate to sport-specific search results
    console.log('Selected sport:', sport.name);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="cursor-pointer group"
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200">
        {/* Image placeholder */}
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-6xl opacity-60">
            {sport.icon}
          </div>
        </div>
        
        <div className="p-4">
          {/* Sport name */}
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {sport.name}
          </h3>
          
          {/* Facilities count */}
          <p className="text-sm text-gray-600">
            {sport.facilities} establecimientos disponibles
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SportCard;
