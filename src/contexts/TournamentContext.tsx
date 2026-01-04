'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Tournament, TournamentRegistration, CreateTournamentData } from '@/types/tournament';
import { apiClient } from '@/lib/api';

interface TournamentContextType {
  tournaments: Tournament[];
  registrations: TournamentRegistration[];
  createTournament: (data: CreateTournamentData) => Promise<Tournament>;
  registerForTournament: (tournamentId: string, playerData: any) => Promise<TournamentRegistration>;
  getTournamentsByEstablishment: (establishmentId: string) => Tournament[];
  getAvailableTournaments: () => Tournament[];
  getPlayerRegistrations: (playerId: string) => TournamentRegistration[];
  processPayment: (registrationId: string, paymentData: any) => Promise<boolean>;
  cancelRegistration: (registrationId: string) => Promise<boolean>;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};

// Mock data
const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Copa de Verano Fútbol 5',
    description: 'Torneo de fútbol 5 para equipos amateur. ¡Inscribite con tu equipo y competí por el gran premio!',
    sport: 'futbol5',
    establishmentId: 'est1',
    establishmentName: 'Complejo Deportivo San Lorenzo',
    startDate: '2025-02-15',
    endDate: '2025-02-28',
    registrationDeadline: '2025-02-10',
    maxParticipants: 16,
    currentParticipants: 8,
    entryFee: 15000,
    prizePool: 200000,
    format: 'single-elimination',
    status: 'registration-open',
    location: 'Palermo, Buenos Aires',
    rules: [
      'Equipos de 5 jugadores + 2 suplentes',
      'Partidos de 25 minutos cada tiempo',
      'Fair play obligatorio',
      'Tarjeta roja = suspensión automática'
    ],
    requirements: [
      'Todos los jugadores deben ser mayores de 18 años',
      'Seguro médico obligatorio',
      'Equipamiento completo del equipo'
    ],
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop&auto=format',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Torneo Padel Mixto',
    description: 'Torneo de paddle mixto. Parejas formadas por un hombre y una mujer.',
    sport: 'paddle',
    establishmentId: 'est2',
    establishmentName: 'Padel Center Norte',
    startDate: '2025-02-20',
    endDate: '2025-02-22',
    registrationDeadline: '2025-02-15',
    maxParticipants: 32,
    currentParticipants: 12,
    entryFee: 8000,
    prizePool: 150000,
    format: 'double-elimination',
    status: 'registration-open',
    location: 'Belgrano, Buenos Aires',
    rules: [
      'Parejas mixtas obligatorias',
      'Partidos al mejor de 3 sets',
      'Tie-break en caso de empate',
      'Respeto mutuo entre jugadores'
    ],
    requirements: [
      'Nivel intermedio mínimo',
      'Paletas en buen estado',
      'Ropa deportiva adecuada'
    ],
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop&auto=format',
    createdAt: '2025-01-10T14:30:00Z',
    updatedAt: '2025-01-10T14:30:00Z'
  }
];

const mockRegistrations: TournamentRegistration[] = [
  {
    id: 'reg1',
    tournamentId: '1',
    playerId: 'player1',
    playerName: 'Juan Pérez',
    playerEmail: 'juan@email.com',
    registrationDate: '2025-01-20T10:00:00Z',
    paymentStatus: 'paid',
    paymentId: 'pay_123',
    teamName: 'Los Tigres FC',
    additionalInfo: 'Equipo con experiencia en torneos locales'
  }
];

interface TournamentProviderProps {
  children: ReactNode;
}

export const TournamentProvider = ({ children }: TournamentProviderProps) => {
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>(mockRegistrations);

  // Transform backend tournament to frontend format
  const transformTournament = (t: any): Tournament => ({
    id: t.id,
    name: t.name,
    description: t.description || '',
    sport: t.sport || 'futbol5',
    establishmentId: t.establishmentId,
    establishmentName: t.establishment?.name || 'Establecimiento',
    startDate: t.startDate,
    endDate: t.endDate,
    registrationDeadline: t.registrationDeadline,
    maxParticipants: t.maxTeams || 16,
    currentParticipants: t.currentTeams || 0,
    entryFee: t.entryFee || 0,
    prizePool: t.prizePool || 0,
    format: t.format || 'single-elimination',
    status: t.status === 'registration_open' ? 'registration-open' : t.status || 'upcoming',
    location: t.establishment?.city || t.establishment?.address || '',
    rules: t.rules ? (Array.isArray(t.rules) ? t.rules : [t.rules]) : [],
    requirements: [],
    image: t.establishment?.images?.[0] || '/api/placeholder/400/300',
    createdAt: t.createdAt,
    updatedAt: t.updatedAt || t.createdAt
  });

  // Load tournaments from API
  const loadTournaments = useCallback(async () => {
    // Don't fetch if user just logged out (no token)
    if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
      return;
    }
    
    try {
      const response = await apiClient.getTournaments() as any;
      const tournamentsData = response.data || response || [];
      
      const transformedTournaments = Array.isArray(tournamentsData)
        ? tournamentsData.map(transformTournament)
        : [];
      
      if (transformedTournaments.length > 0) {
        setTournaments(transformedTournaments);
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
      // Keep mock data as fallback
    }
  }, []);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const createTournament = async (data: CreateTournamentData): Promise<Tournament> => {
    // Try real API first
    try {
      const response = await apiClient.createTournament({
        establishmentId: (data as any).establishmentId || 'current_establishment',
        name: data.name,
        sport: data.sport,
        startDate: data.startDate,
        endDate: data.endDate,
        maxTeams: data.maxParticipants,
        entryFee: data.entryFee,
        description: data.description
      }) as any;

      if (response.success && response.data) {
        const newTournament = transformTournament(response.data);
        setTournaments(prev => [...prev, newTournament]);
        return newTournament;
      }
    } catch (error) {
      console.error('API createTournament failed, using local fallback:', error);
    }

    // Fallback to local creation
    
    const newTournament: Tournament = {
      id: `tournament_${Date.now()}`,
      ...data,
      establishmentId: 'current_establishment', // This would come from auth context
      establishmentName: 'Mi Establecimiento',
      currentParticipants: 0,
      status: 'upcoming',
      image: data.image || '/api/placeholder/400/300',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTournaments(prev => [...prev, newTournament]);
    return newTournament;
  };

  const registerForTournament = async (tournamentId: string, playerData: any): Promise<TournamentRegistration> => {
    // Try real API first
    try {
      await apiClient.registerForTournament(tournamentId, {
        teamName: playerData.teamName,
        players: playerData.players
      });
      await loadTournaments(); // Refresh tournaments list
    } catch (error) {
      console.error('API registerForTournament failed:', error);
    }

    // Create local registration record
    
    const newRegistration: TournamentRegistration = {
      id: `reg_${Date.now()}`,
      tournamentId,
      playerId: playerData.playerId || 'current_player',
      playerName: playerData.playerName,
      playerEmail: playerData.playerEmail,
      registrationDate: new Date().toISOString(),
      paymentStatus: 'pending',
      teamName: playerData.teamName,
      additionalInfo: playerData.additionalInfo
    };

    setRegistrations(prev => [...prev, newRegistration]);
    
    // Update tournament participant count
    setTournaments(prev => prev.map(tournament => 
      tournament.id === tournamentId 
        ? { ...tournament, currentParticipants: tournament.currentParticipants + 1 }
        : tournament
    ));

    return newRegistration;
  };

  const getTournamentsByEstablishment = (establishmentId: string): Tournament[] => {
    return tournaments.filter(tournament => tournament.establishmentId === establishmentId);
  };

  const getAvailableTournaments = (): Tournament[] => {
    return tournaments.filter(tournament => 
      tournament.status === 'registration-open' || tournament.status === 'upcoming'
    );
  };

  const getPlayerRegistrations = (playerId: string): TournamentRegistration[] => {
    return registrations.filter(registration => registration.playerId === playerId);
  };

  const processPayment = async (registrationId: string, paymentData: any): Promise<boolean> => {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setRegistrations(prev => prev.map(registration => 
      registration.id === registrationId 
        ? { ...registration, paymentStatus: 'paid', paymentId: `pay_${Date.now()}` }
        : registration
    ));

    return true;
  };

  const cancelRegistration = async (registrationId: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const registration = registrations.find(r => r.id === registrationId);
    if (registration) {
      // Update tournament participant count
      setTournaments(prev => prev.map(tournament => 
        tournament.id === registration.tournamentId 
          ? { ...tournament, currentParticipants: Math.max(0, tournament.currentParticipants - 1) }
          : tournament
      ));
      
      // Remove registration
      setRegistrations(prev => prev.filter(r => r.id !== registrationId));
    }

    return true;
  };

  return (
    <TournamentContext.Provider value={{
      tournaments,
      registrations,
      createTournament,
      registerForTournament,
      getTournamentsByEstablishment,
      getAvailableTournaments,
      getPlayerRegistrations,
      processPayment,
      cancelRegistration
    }}>
      {children}
    </TournamentContext.Provider>
  );
};
