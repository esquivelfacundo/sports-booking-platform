'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Tournament, TournamentRegistration, CreateTournamentData } from '@/types/tournament';

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
    name: 'Torneo Paddle Mixto',
    description: 'Torneo de paddle mixto. Parejas formadas por un hombre y una mujer.',
    sport: 'paddle',
    establishmentId: 'est2',
    establishmentName: 'Paddle Center Norte',
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
    image: 'https://images.unsplash.com/photo-1544717440-6b6ac3b9d1b8?w=400&h=300&fit=crop&auto=format',
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

  const createTournament = async (data: CreateTournamentData): Promise<Tournament> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
