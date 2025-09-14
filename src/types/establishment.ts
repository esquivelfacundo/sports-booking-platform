export interface EstablishmentRegistration {
  // Paso 1: Información básica (Obligatorio)
  basicInfo: {
    name: string;
    description: string;
    phone: string;
    email: string;
  };
  
  // Ubicación (Obligatorio)
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: { lat: number; lng: number };
  };
  
  // Horarios (Obligatorio)
  schedule: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  
  // Servicios (Obligatorio)
  amenities: string[];
  
  // Imágenes (Obligatorio)
  images: {
    logo?: string;
    photos: Array<string | { id: number; url: string; name: string; size: number }>;
  };
  
  // Canchas (Opcional)
  courts: Court[];
  
  // Personal (Opcional)
  staff: Employee[];
  
  // Meta
  registrationStatus: {
    basicInfo: boolean;
    location: boolean;
    schedule: boolean;
    amenities: boolean;
    images: boolean;
    courts: boolean;
    staff: boolean;
    completedAt?: Date;
  };
}

export interface Court {
  id?: string;
  name: string;
  type: 'futbol' | 'tenis' | 'paddle' | 'basquet' | 'voley' | 'futbol11';
  surface: string;
  capacity: number;
  pricePerHour: number;
  openTime: string;
  closeTime: string;
  lighting: boolean;
  covered: boolean;
  images: string[];
  description?: string;
  dimensions?: {
    length: number;
    width: number;
  };
}

export interface Employee {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'staff' | 'maintenance';
  schedule: string[];
  permissions: string[];
  avatar?: string;
}

export interface RegistrationStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
}

export const REGISTRATION_STEPS: RegistrationStep[] = [
  {
    id: 'basic',
    title: 'Información Básica',
    description: 'Nombre y datos de contacto',
    required: true,
    completed: false
  },
  {
    id: 'location',
    title: 'Ubicación',
    description: 'Dirección del establecimiento',
    required: true,
    completed: false
  },
  {
    id: 'schedule',
    title: 'Horarios',
    description: 'Días y horas de operación',
    required: true,
    completed: false
  },
  {
    id: 'amenities',
    title: 'Servicios',
    description: 'Comodidades disponibles',
    required: true,
    completed: false
  },
  {
    id: 'images',
    title: 'Imágenes',
    description: 'Fotos del establecimiento',
    required: true,
    completed: false
  },
  {
    id: 'courts',
    title: 'Canchas',
    description: 'Espacios deportivos (opcional)',
    required: false,
    completed: false
  },
  {
    id: 'staff',
    title: 'Personal',
    description: 'Empleados y permisos (opcional)',
    required: false,
    completed: false
  }
];

export const SPORTS_OPTIONS = [
  { value: 'futbol', label: 'Fútbol 5', icon: '⚽' },
  { value: 'futbol11', label: 'Fútbol 11', icon: '🏟️' },
  { value: 'tenis', label: 'Tenis', icon: '🎾' },
  { value: 'paddle', label: 'Pádel', icon: '🏓' },
  { value: 'basquet', label: 'Básquet', icon: '🏀' },
  { value: 'voley', label: 'Vóley', icon: '🏐' }
];

export const SURFACE_OPTIONS = [
  'Césped natural',
  'Césped sintético',
  'Cemento',
  'Arcilla',
  'Parquet',
  'Caucho',
  'Arena'
];

export const AMENITIES = [
  'wifi',
  'parking',
  'cafeteria',
  'restaurant',
  'locker_rooms',
  'security',
  'air_conditioning',
  'pool'
];

export const AMENITIES_OPTIONS = [
  'Vestuarios',
  'Estacionamiento',
  'Cafetería/Bar',
  'Tienda deportiva',
  'WiFi gratuito',
  'Duchas',
  'Aire acondicionado',
  'Calefacción',
  'Sonido',
  'Transmisión en vivo',
  'Primeros auxilios'
];

export const EMPLOYEE_ROLES = [
  { value: 'admin', label: 'Administrador', description: 'Acceso total al sistema' },
  { value: 'manager', label: 'Manager', description: 'Gestión operativa y reservas' },
  { value: 'staff', label: 'Staff', description: 'Atención al cliente' },
  { value: 'maintenance', label: 'Mantenimiento', description: 'Solo gestión de canchas' }
];
