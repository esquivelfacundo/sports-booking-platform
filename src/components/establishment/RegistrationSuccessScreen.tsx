'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  CheckCircle, 
  Calendar, 
  Users, 
  Trophy,
  Sparkles,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RegistrationSuccessScreenProps {
  establishmentName?: string;
}

const loadingMessages = [
  {
    icon: Building2,
    text: "Configurando tu establecimiento deportivo...",
    subtext: "Preparamos todo para que puedas gestionar tus canchas"
  },
  {
    icon: Calendar,
    text: "Organizando tu sistema de reservas...",
    subtext: "Configuramos horarios y disponibilidad automática"
  },
  {
    icon: Users,
    text: "Conectando con deportistas de tu zona...",
    subtext: "Tu establecimiento será visible para miles de jugadores"
  },
  {
    icon: Trophy,
    text: "Activando herramientas de gestión...",
    subtext: "Dashboard, reportes y estadísticas listas para usar"
  },
  {
    icon: Shield,
    text: "Verificando tu información...",
    subtext: "Nuestro equipo revisará tu registro en las próximas horas"
  }
];

const RegistrationSuccessScreen: React.FC<RegistrationSuccessScreenProps> = ({ 
  establishmentName = "tu establecimiento" 
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev < loadingMessages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(messageInterval);
          setTimeout(() => setShowFinalMessage(true), 1000);
          return prev;
        }
      });
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 1;
        } else {
          clearInterval(progressInterval);
          return prev;
        }
      });
    }, 150);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const handleAccessDashboard = () => {
    router.push('/establecimientos/login');
  };

  if (showFinalMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring", bounce: 0.4 }}
            className="mb-8"
          >
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse opacity-20"></div>
              <div className="relative bg-gradient-to-r from-red-500 to-red-600 rounded-full w-full h-full flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              ¡Tu dashboard está listo!
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              <span className="text-red-400 font-semibold">{establishmentName}</span> ha sido registrado exitosamente
            </p>
            <p className="text-gray-400">
              Ahora puedes acceder a tu panel de control y comenzar a gestionar tus canchas
            </p>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { icon: Calendar, text: "Gestión de Reservas" },
              { icon: Users, text: "Base de Clientes" },
              { icon: Trophy, text: "Estadísticas" },
              { icon: Building2, text: "Configuración" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 text-center"
              >
                <feature.icon className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <button
              onClick={handleAccessDashboard}
              className="group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25 flex items-center space-x-3 mx-auto"
            >
              <span className="text-lg">Acceder al Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Serás redirigido al inicio de sesión
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const currentMessage = loadingMessages[currentMessageIndex];
  const CurrentIcon = currentMessage.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/10 to-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated Logo/Icon */}
        <motion.div
          key={currentMessageIndex}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="relative mx-auto w-24 h-24 mb-8">
            {/* Outer rotating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-red-500/30 border-t-red-500 rounded-full"
            />
            {/* Inner pulsing circle */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-2 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center backdrop-blur-sm"
            >
              <CurrentIcon className="w-8 h-8 text-red-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
            <motion.div
              className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <p className="text-sm text-gray-500">{progress}% completado</p>
        </div>

        {/* Loading Messages */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {currentMessage.text}
            </h2>
            <p className="text-lg text-gray-400">
              {currentMessage.subtext}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-red-400/30 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
              }}
              animate={{
                y: -10,
                x: Math.random() * window.innerWidth,
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Sparkles effect */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 opacity-20"
        >
          <Sparkles className="w-6 h-6 text-red-400" />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 right-1/4 opacity-20"
        >
          <Sparkles className="w-4 h-4 text-red-400" />
        </motion.div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/3 left-1/3 opacity-20"
        >
          <Sparkles className="w-5 h-5 text-red-400" />
        </motion.div>
      </div>
    </div>
  );
};

export default RegistrationSuccessScreen;
