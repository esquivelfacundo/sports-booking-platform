'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  phoneCode: string;
  flag: string;
}

interface CountrySelectProps {
  value: string;
  onChange: (country: Country) => void;
  className?: string;
}

const countries: Country[] = [
  { code: 'AR', name: 'Argentina', phoneCode: '+54', flag: '🇦🇷' },
  { code: 'BR', name: 'Brasil', phoneCode: '+55', flag: '🇧🇷' },
  { code: 'CL', name: 'Chile', phoneCode: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', phoneCode: '+57', flag: '🇨🇴' },
  { code: 'MX', name: 'México', phoneCode: '+52', flag: '🇲🇽' },
  { code: 'PE', name: 'Perú', phoneCode: '+51', flag: '🇵🇪' },
  { code: 'UY', name: 'Uruguay', phoneCode: '+598', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguay', phoneCode: '+595', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolivia', phoneCode: '+591', flag: '🇧🇴' },
  { code: 'EC', name: 'Ecuador', phoneCode: '+593', flag: '🇪🇨' },
  { code: 'VE', name: 'Venezuela', phoneCode: '+58', flag: '🇻🇪' },
  { code: 'US', name: 'Estados Unidos', phoneCode: '+1', flag: '🇺🇸' },
  { code: 'ES', name: 'España', phoneCode: '+34', flag: '🇪🇸' },
  { code: 'IT', name: 'Italia', phoneCode: '+39', flag: '🇮🇹' },
  { code: 'FR', name: 'Francia', phoneCode: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemania', phoneCode: '+49', flag: '🇩🇪' },
  { code: 'GB', name: 'Reino Unido', phoneCode: '+44', flag: '🇬🇧' }
];

const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  className = ""
}) => {
  const selectedCountry = countries.find(country => country.code === value) || countries[0];

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => {
          const country = countries.find(c => c.code === e.target.value);
          if (country) onChange(country);
        }}
        className={`w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none cursor-pointer ${className}`}
      >
        {countries.map((country) => (
          <option 
            key={country.code} 
            value={country.code}
            className="text-white bg-gray-700"
          >
            {country.flag} {country.name} ({country.phoneCode})
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
    </div>
  );
};

export { countries };
export default CountrySelect;
