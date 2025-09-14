'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock
} from 'lucide-react';
import { EstablishmentRegistration } from '@/types/establishment';

interface ScheduleStepProps {
  data: Partial<EstablishmentRegistration>;
  onUpdate: (data: Partial<EstablishmentRegistration>) => void;
  onValidation: (isValid: boolean) => void;
}

const ScheduleStep: React.FC<ScheduleStepProps> = ({ data, onUpdate, onValidation }) => {
  const [formData, setFormData] = useState({
    schedule: data.schedule || {
      monday: { open: '08:00', close: '22:00', closed: false },
      tuesday: { open: '08:00', close: '22:00', closed: false },
      wednesday: { open: '08:00', close: '22:00', closed: false },
      thursday: { open: '08:00', close: '22:00', closed: false },
      friday: { open: '08:00', close: '22:00', closed: false },
      saturday: { open: '08:00', close: '22:00', closed: false },
      sunday: { open: '08:00', close: '22:00', closed: false }
    }
  });

  const [sameScheduleAllDays, setSameScheduleAllDays] = useState(true);
  const [mounted, setMounted] = useState(false);

  const dayLabels = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Validation and update effects
  useEffect(() => {
    if (!mounted) return;
    onValidation(true);
    onUpdate(formData);
  }, [mounted, formData.schedule]);

  const updateSchedule = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    if (sameScheduleAllDays && (field === 'open' || field === 'close')) {
      // Update all days
      const newSchedule = { ...formData.schedule };
      Object.keys(newSchedule).forEach(dayKey => {
        newSchedule[dayKey] = { ...newSchedule[dayKey], [field]: value };
      });
      setFormData(prev => ({ ...prev, schedule: newSchedule }));
    } else {
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [day]: { ...prev.schedule[day], [field]: value }
        }
      }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Horarios de Operación</h2>
        <p className="text-gray-400">¿Cuándo está abierto tu establecimiento?</p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Configurar Horarios</h3>
          </div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sameScheduleAllDays}
              onChange={(e) => setSameScheduleAllDays(e.target.checked)}
              className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-300">Mismo horario todos los días</span>
          </label>
        </div>

        <div className="space-y-4">
          {Object.entries(formData.schedule).map(([day, schedule]) => (
            <div key={day} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
              <div className="w-24">
                <span className="text-white font-medium">{dayLabels[day as keyof typeof dayLabels]}</span>
              </div>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={schedule.closed}
                  onChange={(e) => updateSchedule(day, 'closed', e.target.checked)}
                  className="w-4 h-4 text-red-500 bg-gray-600 border-gray-500 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-300">Cerrado</span>
              </label>

              {!schedule.closed && (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">Abre:</span>
                    <input
                      type="time"
                      value={schedule.open}
                      onChange={(e) => updateSchedule(day, 'open', e.target.value)}
                      className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">Cierra:</span>
                    <input
                      type="time"
                      value={schedule.close}
                      onChange={(e) => updateSchedule(day, 'close', e.target.value)}
                      className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-white font-medium mb-1">Horarios flexibles</h4>
              <p className="text-gray-400 text-sm">
                Puedes configurar horarios diferentes para cada día. Los horarios de las canchas individuales 
                pueden ser diferentes a los del establecimiento general.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScheduleStep;
