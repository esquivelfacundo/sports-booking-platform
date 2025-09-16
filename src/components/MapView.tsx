'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Loader2 } from 'lucide-react';

interface Facility {
  id: string;
  name: string;
  sport: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image?: string;
  coordinates?: [number, number];
  amenities: string[];
  availability: string[];
}

interface MapViewProps {
  facilities: Facility[];
  onFacilitySelect?: (facility: Facility) => void;
  onMapChange?: (bounds: any, center: {lat: number, lng: number}, zoom: number) => void;
  searchLocation?: string;
}

const MapView = ({ facilities, onFacilitySelect, onMapChange, searchLocation }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  const getSportEmoji = (sport: string) => {
    const sportEmojis: { [key: string]: string } = {
      'futbol5': '⚽',
      'paddle': '🏓',
      'tenis': '🎾',
      'basquet': '🏀'
    };
    return sportEmojis[sport] || '🏟️';
  };

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        console.log('MapView: Starting map initialization...');
        console.log('MapView: Google Maps API Key:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');
        setIsLoading(true);
        setMapError(false);

        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places']
        });

        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          console.warn('Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.');
          setMapError(true);
          setIsLoading(false);
          return;
        }

        console.log('MapView: Loading Google Maps API...');
        const google = await loader.load();
        console.log('MapView: Google Maps API loaded successfully');
        
        // Initialize map with dynamic center
        console.log('MapView: Creating map instance...');
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: -34.6118, lng: -64.4964 }, // Argentina center as fallback
          zoom: 6, // Wider zoom to show all of Argentina initially
          disableDefaultUI: true, // Disable all default UI controls
          zoomControl: false, // Disable zoom controls
          mapTypeControl: false, // Disable map type control
          scaleControl: false, // Disable scale control
          streetViewControl: false, // Disable street view control
          rotateControl: false, // Disable rotate control
          fullscreenControl: false, // Disable fullscreen control
          gestureHandling: 'cooperative', // Require ctrl+scroll to zoom
          styles: [
            {
              featureType: 'poi',
              elementType: 'all',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'poi.business',
              elementType: 'all',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'transit',
              elementType: 'all',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'all',
              elementType: 'geometry.fill',
              stylers: [{ color: '#1f2937' }]
            },
            {
              featureType: 'all',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#ffffff' }]
            },
            {
              featureType: 'all',
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#1f2937' }]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#374151' }]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#0f172a' }]
            }
          ]
        });

        mapInstanceRef.current = map;
        console.log('MapView: Map instance created successfully');
        setIsLoading(false);

      } catch (error) {
        console.error('MapView: Error loading Google Maps:', error);
        setMapError(true);
        setIsLoading(false);
      }
    };

    if (mapRef.current) {
      initMap();
    } else {
      console.log('MapView: Map ref not ready, waiting...');
    }
  }, []);

  // Update markers when facilities change
  useEffect(() => {
    console.log('MapView useEffect triggered:', {
      mapInstance: !!mapInstanceRef.current,
      facilitiesLength: facilities.length,
      facilities: facilities.map(f => ({ name: f.name, coordinates: f.coordinates, lat: (f as any).latitude, lng: (f as any).longitude }))
    });
    
    if (!mapInstanceRef.current) {
      console.log('MapView: Map instance not ready yet');
      return;
    }
    
    if (!facilities.length) {
      console.log('MapView: No facilities to display');
      return;
    }

    // Clear existing markers
    console.log('MapView: Clearing', markersRef.current.length, 'existing markers');
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let markersCreated = 0;

    facilities.forEach((facility, index) => {
      console.log(`MapView: Processing facility ${index + 1}/${facilities.length}:`, {
        name: facility.name,
        coordinates: facility.coordinates,
        latitude: (facility as any).latitude,
        longitude: (facility as any).longitude,
        fullFacility: facility
      });
      
      let lat, lng;
      
      // Try to get coordinates from different possible properties
      if (facility.coordinates && Array.isArray(facility.coordinates)) {
        [lat, lng] = facility.coordinates;
      } else if ((facility as any).latitude && (facility as any).longitude) {
        lat = parseFloat((facility as any).latitude);
        lng = parseFloat((facility as any).longitude);
      } else {
        console.log('MapView: No valid coordinates for facility:', facility.name);
        return;
      }
      
      if (isNaN(lat) || isNaN(lng)) {
        console.log('MapView: Invalid coordinates for facility:', facility.name);
        return;
      }
      
      const position = { lat, lng };
      console.log('MapView: Creating marker at position:', position);
      markersCreated++;
      
      // Create custom marker with price
      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: facility.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 0C8.954 0 0 8.954 0 20c0 20 20 30 20 30s20-10 20-30c0-11.046-8.954-20-20-20z" fill="#ef4444"/>
              <circle cx="20" cy="20" r="12" fill="white"/>
              <circle cx="20" cy="20" r="6" fill="#ef4444"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 50),
          anchor: new google.maps.Point(20, 50)
        }
      });
      
      console.log('MapView: Marker created successfully for:', facility.name, 'at position:', position);

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 200px; background: #1f2937; color: white; border-radius: 8px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 20px; margin-right: 8px;">${getSportEmoji(facility.sport)}</span>
              <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${facility.name}</h3>
            </div>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #9ca3af;">${facility.location}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div style="display: flex; align-items: center;">
                <span style="color: #10b981; margin-right: 4px;">★</span>
                <span style="font-size: 14px; font-weight: 500;">${facility.rating}</span>
                <span style="font-size: 14px; color: #9ca3af; margin-left: 4px;">(${facility.reviews})</span>
              </div>
              <span style="font-size: 14px; font-weight: 600;">$${facility.price}/hora</span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px;">
              ${facility.amenities.slice(0, 3).map(amenity => 
                `<span style="background: #374151; color: #d1d5db; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${amenity}</span>`
              ).join('')}
              ${facility.amenities.length > 3 ? `<span style="color: #9ca3af; font-size: 12px;">+${facility.amenities.length - 3} más</span>` : ''}
            </div>
            <button onclick="window.selectFacility && window.selectFacility('${facility.id}')" 
                    style="width: 100%; background: linear-gradient(to right, #10b981, #06b6d4); color: white; padding: 8px; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">
              Ver detalles
            </button>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
        if (onFacilitySelect) {
          onFacilitySelect(facility);
        }
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Fit map to show all markers with valid coordinates
    if (markersRef.current.length > 0) {
      console.log('MapView: Fitting bounds for', markersRef.current.length, 'markers');
      mapInstanceRef.current.fitBounds(bounds);
      
      // Add some padding and ensure minimum zoom
      setTimeout(() => {
        if (!mapInstanceRef.current) return;
        
        const currentZoom = mapInstanceRef.current.getZoom();
        console.log('MapView: Current zoom after fitBounds:', currentZoom);
        
        if (markersRef.current.length === 1) {
          mapInstanceRef.current.setZoom(14);
        } else if (currentZoom && currentZoom > 15) {
          // If too zoomed in, zoom out a bit to see multiple markers
          mapInstanceRef.current.setZoom(12);
        }
      }, 100);
    } else {
      // No facilities with coordinates, keep default view of Argentina
      console.log('MapView: No markers created, using default Argentina view');
      mapInstanceRef.current.setCenter({ lat: -34.6118, lng: -64.4964 });
      mapInstanceRef.current.setZoom(6);
    }
  }, [facilities, onFacilitySelect]);

  // Error fallback
  if (mapError) {
    return (
      <div className="relative h-full w-full bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Mapa no disponible</h3>
          <p className="text-gray-400 text-center mb-6">
            No se pudo cargar Google Maps. Verifica tu conexión a internet.
          </p>
          <div className="w-full max-w-md space-y-3 max-h-96 overflow-y-auto">
            {facilities.map((facility) => (
              <div key={facility.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm">{facility.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{facility.location}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <div className="flex items-center space-x-1">
                        <span className="text-emerald-400 text-xs">★</span>
                        <span className="text-xs text-white">{facility.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">({facility.reviews})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-white">${facility.price}</span>
                    <p className="text-xs text-gray-400">por hora</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Cargando Google Maps...</p>
          </div>
        </div>
      )}
      
      {/* Google Maps container */}
      <div ref={mapRef} className="h-full w-full rounded-lg" />
      
      {/* Facility count overlay */}
      {!isLoading && (
        <div className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg px-3 py-2 z-10">
          <span className="text-sm font-medium text-white">
            {facilities.length} canchas en el mapa
          </span>
        </div>
      )}
    </div>
  );
};

export default MapView;
