'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string, placeData?: any) => void;
  placeholder?: string;
  className?: string;
}

const GooglePlacesAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "¿A dónde vas?",
  className = ""
}: GooglePlacesAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Mock Google Places data for Argentina cities and neighborhoods
  const mockPlaces = [
    { place_id: '1', description: 'Buenos Aires, Argentina', structured_formatting: { main_text: 'Buenos Aires', secondary_text: 'Argentina' }, geometry: { location: { lat: -34.6037, lng: -58.3816 } } },
    { place_id: '2', description: 'Palermo, Buenos Aires, Argentina', structured_formatting: { main_text: 'Palermo', secondary_text: 'Buenos Aires, Argentina' }, geometry: { location: { lat: -34.5755, lng: -58.4338 } } },
    { place_id: '3', description: 'Recoleta, Buenos Aires, Argentina', structured_formatting: { main_text: 'Recoleta', secondary_text: 'Buenos Aires, Argentina' }, geometry: { location: { lat: -34.5875, lng: -58.3974 } } },
    { place_id: '4', description: 'San Telmo, Buenos Aires, Argentina', structured_formatting: { main_text: 'San Telmo', secondary_text: 'Buenos Aires, Argentina' }, geometry: { location: { lat: -34.6214, lng: -58.3731 } } },
    { place_id: '5', description: 'Puerto Madero, Buenos Aires, Argentina', structured_formatting: { main_text: 'Puerto Madero', secondary_text: 'Buenos Aires, Argentina' }, geometry: { location: { lat: -34.6118, lng: -58.3634 } } },
    { place_id: '6', description: 'Belgrano, Buenos Aires, Argentina', structured_formatting: { main_text: 'Belgrano', secondary_text: 'Buenos Aires, Argentina' }, geometry: { location: { lat: -34.5627, lng: -58.4548 } } },
    { place_id: '7', description: 'Villa Crespo, Buenos Aires, Argentina', structured_formatting: { main_text: 'Villa Crespo', secondary_text: 'Buenos Aires, Argentina' }, geometry: { location: { lat: -34.5998, lng: -58.4394 } } },
    { place_id: '8', description: 'Caballito, Buenos Aires, Argentina', structured_formatting: { main_text: 'Caballito', secondary_text: 'Buenos Aires, Argentina' }, geometry: { location: { lat: -34.6198, lng: -58.4394 } } },
    { place_id: '9', description: 'Córdoba, Argentina', structured_formatting: { main_text: 'Córdoba', secondary_text: 'Argentina' }, geometry: { location: { lat: -31.4201, lng: -64.1888 } } },
    { place_id: '10', description: 'Rosario, Santa Fe, Argentina', structured_formatting: { main_text: 'Rosario', secondary_text: 'Santa Fe, Argentina' }, geometry: { location: { lat: -32.9442, lng: -60.6505 } } },
    { place_id: '11', description: 'La Plata, Buenos Aires, Argentina', structured_formatting: { main_text: 'La Plata', secondary_text: 'Buenos Aires, Argentina' }, geometry: { location: { lat: -34.9215, lng: -57.9545 } } },
    { place_id: '12', description: 'Mar del Plata, Buenos Aires, Argentina', structured_formatting: { main_text: 'Mar del Plata', secondary_text: 'Buenos Aires, Argentina' }, geometry: { location: { lat: -38.0055, lng: -57.5426 } } },
    { place_id: '13', description: 'Mendoza, Argentina', structured_formatting: { main_text: 'Mendoza', secondary_text: 'Argentina' }, geometry: { location: { lat: -32.8908, lng: -68.8272 } } },
    { place_id: '14', description: 'Salta, Argentina', structured_formatting: { main_text: 'Salta', secondary_text: 'Argentina' }, geometry: { location: { lat: -24.7821, lng: -65.4232 } } },
    { place_id: '15', description: 'Bariloche, Río Negro, Argentina', structured_formatting: { main_text: 'Bariloche', secondary_text: 'Río Negro, Argentina' }, geometry: { location: { lat: -41.1335, lng: -71.3103 } } },
    { place_id: '16', description: 'Tigre, Buenos Aires, Argentina', structured_formatting: { main_text: 'Tigre', secondary_text: 'Buenos Aires, Argentina' }, geometry: { location: { lat: -34.4264, lng: -58.5799 } } },
    { place_id: '17', description: 'San Isidro, Buenos Aires, Argentina', structured_formatting: { main_text: 'San Isidro', secondary_text: 'Buenos Aires, Argentina' }, geometry: { location: { lat: -34.4708, lng: -58.5369 } } },
    { place_id: '18', description: 'Vicente López, Buenos Aires, Argentina', structured_formatting: { main_text: 'Vicente López', secondary_text: 'Buenos Aires, Argentina' }, geometry: { location: { lat: -34.5267, lng: -58.4794 } } },
    { place_id: '19', description: 'Olivos, Buenos Aires, Argentina', structured_formatting: { main_text: 'Olivos', secondary_text: 'Buenos Aires, Argentina' }, geometry: { location: { lat: -34.5067, lng: -58.4894 } } },
    { place_id: '20', description: 'Martínez, Buenos Aires, Argentina', structured_formatting: { main_text: 'Martínez', secondary_text: 'Buenos Aires, Argentina' }, geometry: { location: { lat: -34.4881, lng: -58.5067 } } }
  ];

  const searchPlaces = (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const filteredPlaces = mockPlaces.filter(place => 
        place.description.toLowerCase().includes(query.toLowerCase()) ||
        place.structured_formatting.main_text.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      
      setSuggestions(filteredPlaces);
      setShowSuggestions(true);
      setIsLoading(false);
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue, undefined);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce search
    timeoutRef.current = setTimeout(() => {
      searchPlaces(newValue);
    }, 300);
  };

  const handleSuggestionClick = (place: any) => {
    onChange(place.description, place);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const clearInput = () => {
    onChange('', undefined);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.closest('.places-autocomplete-container')?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="places-autocomplete-container relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => value && searchPlaces(value)}
          className={`w-full ${className}`}
          suppressHydrationWarning={true}
        />
        
        {value && (
          <button
            onClick={clearInput}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400 mx-auto"></div>
              <p className="text-sm text-gray-400 mt-2">Buscando ubicaciones...</p>
            </div>
          ) : (
            suggestions.map((place) => (
              <button
                key={place.place_id}
                onClick={() => handleSuggestionClick(place)}
                className="w-full px-4 py-3 text-left hover:bg-gray-600 flex items-center space-x-3 text-white text-sm transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white">
                    {place.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {place.structured_formatting.secondary_text}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete;
