export interface Base {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  metadata?: Record<string, unknown>;
}

export interface Squadron {
  id: string;
  baseId: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface UpdateInfo {
  name: string; // שם המעדכן
  personalNumber: string; // מספר אישי
  phone: string; // טלפון
}

export interface Shelter {
  id: string;
  squadronId: string;
  name: string;
  latitude: number;
  longitude: number;
  aircraftType: 'fighter' | 'bomber' | 'transport' | 'recon' | 'helicopter'; // סוג מטוס/מסוק שהדתק מייצג
  lastUpdated?: Date; // תאריך ושעה של עדכון אחרון
  updatedBy?: UpdateInfo; // מי עדכן
}

export interface Dome {
  id: string;
  shelterId: string;
  name: string;
  latitude: number;
  longitude: number;
  aircraftId: string | null; // null אם אין מטוס
  lastUpdated?: Date; // תאריך ושעה של עדכון אחרון
  updatedBy?: UpdateInfo; // מי עדכן
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
  location: 'ground' | 'air'; // מיקום המטוס - על הקרקע או באוויר
  locationUncertain?: boolean; // האם מיקום המטוס לא מעודכן (חשוד)
  uncertainLatitude?: number; // קואורדינטה לא ודאית (אם locationUncertain = true)
  uncertainLongitude?: number; // קואורדינטה לא ודאית (אם locationUncertain = true)
  assignedPositionId: string | null;
  assignedDomeId: string | null; // כיפה מוקצית
  homeLatitude?: number;
  homeLongitude?: number;
  lastStatusUpdate?: Date; // תאריך ושעה של עדכון סטטוס אחרון
  lastStatusUpdatedBy?: UpdateInfo; // מי עדכן את הסטטוס
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
