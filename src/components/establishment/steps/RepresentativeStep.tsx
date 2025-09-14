'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, FileText, Building, MapPin, Lock } from 'lucide-react';
import { EstablishmentRegistration } from '@/types/establishment';
import { POSITION_OPTIONS } from '@/constants/argentina';
import PhoneInput from '@/components/ui/PhoneInput';
import GooglePlacesAutocomplete from '@/components/ui/GooglePlacesAutocomplete';

interface RepresentativeStepProps {
  data: Partial<EstablishmentRegistration>;
  onUpdate: (data: Partial<EstablishmentRegistration>) => void;
  onValidation: (isValid: boolean) => void;
}

const RepresentativeStep: React.FC<RepresentativeStepProps> = ({
  data,
  onUpdate,
  onValidation
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const representative = {
    fullName: data.representative?.fullName || '',
    email: data.representative?.email || '',
    whatsapp: data.representative?.whatsapp || '',
    documentType: data.representative?.documentType || 'dni' as const,
    documentNumber: data.representative?.documentNumber || '',
    position: data.representative?.position || '',
    businessName: data.representative?.businessName || '',
    taxId: data.representative?.taxId || '',
    address: data.representative?.address || '',
    password: data.representative?.password || ''
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'fullName':
        return value.trim().length >= 2;
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'whatsapp':
        return /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''));
      case 'documentNumber':
        return value.trim().length >= 7;
      case 'position':
        return value.trim().length >= 2;
      case 'address':
        return value.trim().length >= 10;
      case 'password':
        return value.length >= 6;
      default:
        return true;
    }
  };

  const isFormValid = () => {
    const requiredFields = ['fullName', 'email', 'whatsapp', 'documentNumber', 'position', 'address', 'password'];
    return requiredFields.every(field => {
      const value = representative[field as keyof typeof representative] as string;
      return value && validateField(field, value);
    });
  };

  useEffect(() => {
    onValidation(isFormValid());
  }, [representative.fullName, representative.email, representative.whatsapp, representative.documentType, representative.documentNumber, representative.position, representative.businessName, representative.taxId, representative.address, representative.password]);

  const handleInputChange = (field: string, value: string) => {
    const updatedRepresentative = {
      ...representative,
      [field]: value
    };

    onUpdate({
      ...data,
      representative: updatedRepresentative
    });
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field: string) => {
    if (!touched[field]) return '';
    
    const value = representative[field as keyof typeof representative] as string;
    
    switch (field) {
      case 'fullName':
        return !validateField(field, value) ? 'Ingresa el nombre completo' : '';
      case 'email':
        return !validateField(field, value) ? 'Ingresa un email válido' : '';
      case 'whatsapp':
        return !validateField(field, value) ? 'Ingresa un número de WhatsApp válido' : '';
      case 'documentNumber':
        return !validateField(field, value) ? 'Ingresa un número de documento válido' : '';
      case 'position':
        return !validateField(field, value) ? 'Ingresa el cargo o posición' : '';
      case 'address':
        return !validateField(field, value) ? 'Ingresa una dirección completa' : '';
      case 'password':
        return !validateField(field, value) ? 'Ingresa una contraseña (mínimo 6 caracteres)' : '';
      default:
        return '';
    }
  };

  if (!isMounted) {
    return <div className="animate-pulse bg-gray-700 h-96 rounded-lg"></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <User className="w-8 h-8 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Representante Legal</h2>
        </div>
        <p className="text-gray-400">
          Información del responsable legal del establecimiento para comunicaciones oficiales
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre Completo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Nombre Completo *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={representative.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
              className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                getFieldError('fullName')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:ring-emerald-500'
              }`}
              placeholder="Juan Pérez"
              autoComplete="name"
            />
          </div>
          {getFieldError('fullName') && (
            <p className="text-red-400 text-sm">{getFieldError('fullName')}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={representative.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                getFieldError('email')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:ring-emerald-500'
              }`}
              placeholder="juan@ejemplo.com"
              autoComplete="email"
            />
          </div>
          {getFieldError('email') && (
            <p className="text-red-400 text-sm">{getFieldError('email')}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            WhatsApp *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <PhoneInput
              value={representative.whatsapp}
              onChange={(value) => handleInputChange('whatsapp', value)}
              placeholder="Número de WhatsApp"
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 border-gray-600 focus:ring-emerald-500"
              error={getFieldError('whatsapp')}
            />
          </div>
        </div>

        {/* Tipo de Documento */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Tipo de Documento *
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={representative.documentType}
              onChange={(e) => handleInputChange('documentType', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
            >
              <option value="dni">DNI</option>
              <option value="cuit">CUIT</option>
              <option value="cuil">CUIL</option>
              <option value="passport">Pasaporte</option>
            </select>
          </div>
        </div>

        {/* Número de Documento */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Número de Documento *
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={representative.documentNumber}
              onChange={(e) => handleInputChange('documentNumber', e.target.value)}
              onBlur={() => handleBlur('documentNumber')}
              className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                getFieldError('documentNumber')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:ring-emerald-500'
              }`}
              placeholder="12345678"
              autoComplete="off"
            />
          </div>
          {getFieldError('documentNumber') && (
            <p className="text-red-400 text-sm">{getFieldError('documentNumber')}</p>
          )}
        </div>

        {/* Cargo/Posición */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Cargo/Posición *
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={representative.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              onBlur={() => handleBlur('position')}
              className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                getFieldError('position')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:ring-emerald-500'
              }`}
            >
              <option value="">Selecciona un cargo</option>
              {POSITION_OPTIONS.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
          {getFieldError('position') && (
            <p className="text-red-400 text-sm">{getFieldError('position')}</p>
          )}
        </div>
      </div>

      {/* Información Adicional */}
      <div className="space-y-6 pt-6 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-white">Información Adicional (Opcional)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Razón Social */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Razón Social
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={representative.businessName || ''}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                placeholder="Nombre de la empresa"
                autoComplete="organization"
              />
            </div>
          </div>

          {/* CUIT/CUIL Empresarial */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              CUIT/CUIL Empresarial
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={representative.taxId || ''}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                placeholder="20-12345678-9"
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        {/* Dirección del Representante */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Dirección del Representante *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <GooglePlacesAutocomplete
              value={representative.address}
              onChange={(value) => handleInputChange('address', value)}
              placeholder="Av. Corrientes 1234, CABA, Argentina"
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 border-gray-600 focus:ring-emerald-500"
              error={getFieldError('address')}
              types={['address']}
            />
          </div>
        </div>

        {/* Datos de Acceso */}
        <div className="col-span-1 md:col-span-2">
          <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Lock className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-emerald-300">Datos de Acceso al Sistema</h3>
            </div>
            <p className="text-emerald-200 text-sm mb-6">
              Estos datos serán utilizados para acceder al panel de administración del establecimiento.
            </p>
            
            <div className="grid grid-cols-1 gap-6">

              {/* Contraseña */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Contraseña de Acceso *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={representative.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      getFieldError('password') ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-emerald-500'
                    }`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                {getFieldError('password') && (
                  <p className="text-red-400 text-sm">{getFieldError('password')}</p>
                )}
                <p className="text-gray-400 text-xs">
                  Usarás tu email ({representative.email || 'email@ejemplo.com'}) y esta contraseña para acceder al sistema.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información Legal */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <FileText className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className="text-blue-300 font-semibold mb-2">Información Importante</h4>
            <p className="text-blue-200 text-sm leading-relaxed">
              Los datos del representante legal serán utilizados para comunicaciones oficiales, 
              facturación y aspectos legales de la plataforma. Asegúrate de que la información 
              sea correcta y esté actualizada.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RepresentativeStep;
