'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ProvinceSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const argentineProvinces = [
  { code: 'CABA', name: 'Ciudad Autónoma de Buenos Aires' },
  { code: 'BA', name: 'Buenos Aires' },
  { code: 'CAT', name: 'Catamarca' },
  { code: 'CHA', name: 'Chaco' },
  { code: 'CHU', name: 'Chubut' },
  { code: 'COR', name: 'Córdoba' },
  { code: 'CTE', name: 'Corrientes' },
  { code: 'ER', name: 'Entre Ríos' },
  { code: 'FOR', name: 'Formosa' },
  { code: 'JUJ', name: 'Jujuy' },
  { code: 'LP', name: 'La Pampa' },
  { code: 'LR', name: 'La Rioja' },
  { code: 'MEN', name: 'Mendoza' },
  { code: 'MIS', name: 'Misiones' },
  { code: 'NEU', name: 'Neuquén' },
  { code: 'RN', name: 'Río Negro' },
  { code: 'SAL', name: 'Salta' },
  { code: 'SJ', name: 'San Juan' },
  { code: 'SL', name: 'San Luis' },
  { code: 'SC', name: 'Santa Cruz' },
  { code: 'SF', name: 'Santa Fe' },
  { code: 'SE', name: 'Santiago del Estero' },
  { code: 'TF', name: 'Tierra del Fuego' },
  { code: 'TUC', name: 'Tucumán' }
];

const ProvinceSelect: React.FC<ProvinceSelectProps> = ({
  value,
  onChange,
  placeholder = "Selecciona tu provincia",
  className = "",
  required = false
}) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer ${className}`}
      >
        <option value="" disabled className="text-gray-400">
          {placeholder}
        </option>
        {argentineProvinces.map((province) => (
          <option 
            key={province.code} 
            value={province.name}
            className="text-white bg-gray-700"
          >
            {province.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
    </div>
  );
};

export default ProvinceSelect;
