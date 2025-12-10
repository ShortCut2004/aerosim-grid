export interface Base {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  metadata?: Record<string, unknown>;
}

export interface Position {
  id: string;
  baseId: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'hardpoint' | 'hangar' | 'apron' | 'runway';
  capacity: number;
}

export interface Aircraft {
  id: string;
  type: 'fighter' | 'bomber' | 'transport' | 'recon' | 'helicopter';
  callsign: string;
  size: 'small' | 'medium' | 'large';
  status: 'assigned' | 'unassigned' | 'maintenance' | 'deployed';
  assignedPositionId: string | null;
  homeLatitude?: number;
  homeLongitude?: number;
}

export interface Assignment {
  aircraftId: string;
  positionId: string;
  timestamp: Date;
}

export type UserRole = 'admin' | 'viewer';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export type PlacementMode = 'manual' | 'automatic';

export type AlgorithmType = 'spread-evenly' | 'cluster' | 'minimize-distance';

export interface AlgorithmParams {
  randomnessFactor: number;
  maxPerPosition: number;
  distanceWeight: number;
}

export interface TableRow {
  id: string;
  base: string;
  positionName: string;
  capacity: number;
  assignedAircraft: string[];
  notes: string;
}
