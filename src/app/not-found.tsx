'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, Search, ArrowLeft, MapPin } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating sports balls */}
        <motion.div
          className="absolute top-20 left-10 text-6xl opacity-20"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ⚽
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 text-5xl opacity-20"
          animate={{
            y: [0, 20, 0],
            rotate: [0, -15, 15, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          🎾
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-1/4 text-5xl opacity-20"
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          🏀
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-1/3 text-4xl opacity-20"
          animate={{
            y: [0, 15, 0],
            rotate: [0, 20, -20, 0],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8
          }}
        >
          🏐
        </motion.div>
        
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.1, 0.15],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            type: "spring",
            stiffness: 200
          }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <motion.span
              className="text-[150px] md:text-[200px] font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent leading-none"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
            >
              404
            </motion.span>
            
            {/* Bouncing ball on the 4 */}
            <motion.div
              className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-4xl"
              animate={{
                y: [0, -30, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "easeOut"
              }}
            >
              🎾
            </motion.div>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¡Ups! Cancha no encontrada
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            Parece que esta página se fue a jugar a otro lado. 
            No te preocupes, te ayudamos a volver al partido.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
            >
              <Home className="w-5 h-5" />
              Volver al inicio
            </motion.button>
          </Link>
          
          <Link href="/buscar">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gray-700/50 text-white font-semibold rounded-xl border border-gray-600 hover:bg-gray-700 transition-colors"
            >
              <Search className="w-5 h-5" />
              Buscar canchas
            </motion.button>
          </Link>
        </motion.div>

        {/* Fun fact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 max-w-md mx-auto"
        >
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">¿Sabías que?</span>
          </div>
          <p className="text-gray-400 text-sm">
            En Mis Canchas podés encontrar más de 100 establecimientos deportivos 
            para reservar tu próximo partido. ¡Explorá nuestras opciones!
          </p>
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-8"
        >
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la página anterior
          </button>
        </motion.div>
      </div>
    </div>
  );
}
