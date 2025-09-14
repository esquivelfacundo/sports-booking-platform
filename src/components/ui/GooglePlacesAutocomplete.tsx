'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

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

  const initializeAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places) return;

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
  }, [types, componentRestrictions, onChange, onPlaceSelect]);

  const loadGoogleMapsScript = useCallback(() => {
    // Check if script already exists
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      initializeAutocomplete();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.addEventListener('load', () => {
      initializeAutocomplete();
      setIsLoaded(true);
    });
    
    script.addEventListener('error', () => {
      console.warn('Google Maps API failed to load, autocomplete will be disabled');
    });
    
    document.head.appendChild(script);
  }, [initializeAutocomplete]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      initializeAutocomplete();
      setIsLoaded(true);
    } else {
      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Script already exists, wait for it to load
        existingScript.addEventListener('load', loadGoogleMapsScript);
      } else {
        loadGoogleMapsScript();
      }
    }

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [loadGoogleMapsScript, initializeAutocomplete]);

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
