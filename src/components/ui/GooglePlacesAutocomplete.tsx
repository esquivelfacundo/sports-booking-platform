'use client';

import React, { useRef, useEffect, useState } from 'react';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string, placeDetails?: any) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  types?: string[];
  componentRestrictions?: { country: string };
  onPlaceSelect?: (place: any) => void;
}

const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Buscar dirección...",
  className = "",
  error,
  types = ['address'],
  componentRestrictions = { country: 'ar' },
  onPlaceSelect
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        initializeAutocomplete();
        setIsLoaded(true);
      } else {
        // Load Google Maps script if not already loaded
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initializeAutocomplete();
          setIsLoaded(true);
        };
        document.head.appendChild(script);
      }
    };

    const initializeAutocomplete = () => {
      if (!inputRef.current || !window.google) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types,
          componentRestrictions
        }
      );

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.formatted_address) {
          onChange(place.formatted_address, place);
          if (onPlaceSelect) {
            onPlaceSelect(place);
          }
        }
      });
    };

    loadGoogleMaps();

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [types, componentRestrictions, onChange, onPlaceSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`${className} ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        autoComplete="off"
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default GooglePlacesAutocomplete;
