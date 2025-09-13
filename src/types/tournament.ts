export interface Tournament {
  id: string;
  name: string;
  description: string;
  sport: string;
  establishmentId: string;
  establishmentName: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  prizePool: number;
  format: 'single-elimination' | 'double-elimination' | 'round-robin' | 'group-stage';
  status: 'upcoming' | 'registration-open' | 'registration-closed' | 'in-progress' | 'completed' | 'cancelled';
  location: string;
  rules: string[];
  requirements: string[];
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  playerId: string;
  playerName: string;
  playerEmail: string;
  registrationDate: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  teamName?: string;
  additionalInfo?: string;
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  player1Id?: string;
  player2Id?: string;
  player1Name?: string;
  player2Name?: string;
  winnerId?: string;
  score?: string;
  scheduledDate?: string;
  completedDate?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface CreateTournamentData {
  name: string;
  description: string;
  sport: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  entryFee: number;
  prizePool: number;
  format: Tournament['format'];
  location: string;
  rules: string[];
  requirements: string[];
  image?: string;
}
