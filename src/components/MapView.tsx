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
}

const MapView = ({ facilities, onFacilitySelect, onMapChange }: MapViewProps) => {
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

        const google = await loader.load();
        
        // Initialize map
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
          zoom: 12,
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
              "elementType": "geometry",
              "stylers": [{"color": "#212121"}]
            },
            {
              "elementType": "labels.icon",
              "stylers": [{"visibility": "off"}]
            },
            {
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#757575"}]
            },
            {
              "elementType": "labels.text.stroke",
              "stylers": [{"color": "#212121"}]
            },
            {
              "featureType": "administrative",
              "elementType": "geometry",
              "stylers": [{"color": "#757575"}]
            },
            {
              "featureType": "administrative.country",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#9ca5b3"}]
            },
            {
              "featureType": "road",
              "elementType": "geometry.fill",
              "stylers": [{"color": "#2c2c2c"}]
            },
            {
              "featureType": "road",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#8a8a8a"}]
            },
            {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [{"color": "#000000"}]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.fill",
              "stylers": [{"color": "#3d3d3d"}]
            }
          ]
        });

        mapInstanceRef.current = map;
        
        // Add map event listeners for bounds and zoom changes
        if (onMapChange) {
          const updateMapState = () => {
            const bounds = map.getBounds();
            const center = map.getCenter();
            const zoom = map.getZoom();
            
            if (bounds && center && zoom) {
              onMapChange(
                {
                  north: bounds.getNorthEast().lat(),
                  south: bounds.getSouthWest().lat(),
                  east: bounds.getNorthEast().lng(),
                  west: bounds.getSouthWest().lng()
                },
                { lat: center.lat(), lng: center.lng() },
                zoom
              );
            }
          };
          
          // Listen for map changes
          map.addListener('bounds_changed', updateMapState);
          map.addListener('zoom_changed', updateMapState);
          
          // Initial call to set initial bounds
          google.maps.event.addListenerOnce(map, 'idle', updateMapState);
        }
        
        setIsLoading(false);

      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setMapError(true);
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  // Add markers when facilities change
  useEffect(() => {
    if (!mapInstanceRef.current || !facilities.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    facilities.forEach((facility) => {
      if (!facility.coordinates) return;
      const position = { lat: facility.coordinates[0], lng: facility.coordinates[1] };
      
      // Create custom marker with price
      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: facility.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="60" height="40" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="5" width="50" height="30" rx="15" fill="#1f2937" stroke="#10b981" stroke-width="2"/>
              <text x="30" y="24" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">$${facility.price}</text>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(60, 40),
          anchor: new google.maps.Point(30, 20)
        }
      });

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

    // Fit map to show all markers
    if (facilities.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
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
