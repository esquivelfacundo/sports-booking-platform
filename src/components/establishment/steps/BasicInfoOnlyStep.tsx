'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { EstablishmentRegistration } from '@/types/establishment';
import PhoneInput from '@/components/ui/PhoneInput';

interface BasicInfoOnlyStepProps {
  data: Partial<EstablishmentRegistration>;
  onUpdate: (data: Partial<EstablishmentRegistration>) => void;
  onValidation: (isValid: boolean) => void;
}

const BasicInfoOnlyStep: React.FC<BasicInfoOnlyStepProps> = ({ data, onUpdate, onValidation }) => {
  const [formData, setFormData] = useState({
    basicInfo: data.basicInfo || { name: '', description: '', phone: '', email: '' }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const onValidationRef = useRef(onValidation);
  const onUpdateRef = useRef(onUpdate);

  // Keep callback refs updated
  useEffect(() => {
    onValidationRef.current = onValidation;
    onUpdateRef.current = onUpdate;
  }, [onValidation, onUpdate]);

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (touched.name && !formData.basicInfo.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (touched.description && !formData.basicInfo.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (touched.phone && !formData.basicInfo.phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    if (touched.email) {
      if (!formData.basicInfo.email.trim()) {
        newErrors.email = 'El email es obligatorio';
      } else if (!/\S+@\S+\.\S+/.test(formData.basicInfo.email)) {
        newErrors.email = 'Email inválido';
      }
    }

    setErrors(newErrors);
    
    const allRequiredFilled = 
      formData.basicInfo.name.trim() &&
      formData.basicInfo.description.trim() &&
      formData.basicInfo.phone.trim() &&
      formData.basicInfo.email.trim() &&
      /\S+@\S+\.\S+/.test(formData.basicInfo.email);
    
    onValidationRef.current(Boolean(allRequiredFilled));
  }, [formData.basicInfo, touched]);

  useEffect(() => {
    if (!mounted) return;
    validateForm();
  }, [mounted, validateForm]);

  // Update parent data
  useEffect(() => {
    if (!mounted) return;
    onUpdateRef.current(formData);
  }, [formData, mounted]);

  const updateBasicInfo = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFormData(prev => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, [field]: value }
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Información Básica</h2>
        <p className="text-gray-400">Empecemos con los datos principales de tu establecimiento</p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-2xl mx-auto"
      >
        <div className="flex items-center space-x-2 mb-6">
          <Building2 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Datos del Establecimiento</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nombre del Establecimiento *
          </label>
          <input
            type="text"
            value={formData.basicInfo.name}
            onChange={(e) => updateBasicInfo('name', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
              errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-emerald-500'
            }`}
            placeholder="Ej: Club Deportivo Central"
            spellCheck="false"
            autoComplete="off"
          />
          {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descripción Breve *
          </label>
          <textarea
            value={formData.basicInfo.description}
            onChange={(e) => updateBasicInfo('description', e.target.value)}
            rows={3}
            className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none ${
              errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-emerald-500'
            }`}
            placeholder="Describe brevemente tu establecimiento y lo que lo hace especial..."
            spellCheck="false"
          />
          {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Teléfono de Contacto *
            </label>
            <PhoneInput
              value={formData.basicInfo.phone}
              onChange={(value) => updateBasicInfo('phone', value)}
              placeholder="Número de teléfono"
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-emerald-500'
              }`}
              error={errors.phone}
            />
            {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email de Contacto *
            </label>
            <input
              type="email"
              value={formData.basicInfo.email}
              onChange={(e) => updateBasicInfo('email', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-emerald-500'
              }`}
              placeholder="contacto@miestablecimiento.com"
              spellCheck="false"
              autoComplete="email"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BasicInfoOnlyStep;
