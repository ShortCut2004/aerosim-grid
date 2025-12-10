import { Base, Position, Aircraft } from '@/types/simulation';

// Synthetic sample data for Test Region A (fictional coordinates)
// These coordinates are intentionally fictional and do not represent real locations

export const sampleBases: Base[] = [
  {
    id: 'base-01',
    name: 'Test Base Alpha',
    latitude: 31.900,
    longitude: 34.850,
    capacity: 12,
    metadata: { region: 'Test Region A', status: 'active' }
  },
  {
    id: 'base-02',
    name: 'Test Base Bravo',
    latitude: 32.250,
    longitude: 35.050,
    capacity: 8,
    metadata: { region: 'Test Region A', status: 'active' }
  },
  {
    id: 'base-03',
    name: 'Test Base Charlie',
    latitude: 31.550,
    longitude: 35.250,
    capacity: 16,
    metadata: { region: 'Test Region A', status: 'active' }
  }
];

export const samplePositions: Position[] = [
  // Base Alpha positions
  { id: 'pos-a1', baseId: 'base-01', name: 'Hardpoint A1', latitude: 31.9015, longitude: 34.8515, type: 'hardpoint', capacity: 2 },
  { id: 'pos-a2', baseId: 'base-01', name: 'Hardpoint A2', latitude: 31.8995, longitude: 34.8485, type: 'hardpoint', capacity: 2 },
  { id: 'pos-a3', baseId: 'base-01', name: 'Hangar A1', latitude: 31.9020, longitude: 34.8490, type: 'hangar', capacity: 4 },
  { id: 'pos-a4', baseId: 'base-01', name: 'Apron A1', latitude: 31.8985, longitude: 34.8520, type: 'apron', capacity: 4 },
  
  // Base Bravo positions
  { id: 'pos-b1', baseId: 'base-02', name: 'Hardpoint B1', latitude: 32.2495, longitude: 35.0510, type: 'hardpoint', capacity: 2 },
  { id: 'pos-b2', baseId: 'base-02', name: 'Hardpoint B2', latitude: 32.2520, longitude: 35.0480, type: 'hardpoint', capacity: 2 },
  { id: 'pos-b3', baseId: 'base-02', name: 'Hangar B1', latitude: 32.2475, longitude: 35.0465, type: 'hangar', capacity: 4 },
  
  // Base Charlie positions
  { id: 'pos-c1', baseId: 'base-03', name: 'Hardpoint C1', latitude: 31.5515, longitude: 35.2480, type: 'hardpoint', capacity: 2 },
  { id: 'pos-c2', baseId: 'base-03', name: 'Hardpoint C2', latitude: 31.5530, longitude: 35.2525, type: 'hardpoint', capacity: 2 },
  { id: 'pos-c3', baseId: 'base-03', name: 'Hardpoint C3', latitude: 31.5495, longitude: 35.2510, type: 'hardpoint', capacity: 2 },
  { id: 'pos-c4', baseId: 'base-03', name: 'Hangar C1', latitude: 31.5480, longitude: 35.2470, type: 'hangar', capacity: 6 },
  { id: 'pos-c5', baseId: 'base-03', name: 'Apron C1', latitude: 31.5470, longitude: 35.2500, type: 'apron', capacity: 4 },
];

export const sampleAircraft: Aircraft[] = [
  { id: 'plane-001', type: 'fighter', callsign: 'TFA-001', size: 'small', status: 'unassigned', assignedPositionId: null },
  { id: 'plane-002', type: 'fighter', callsign: 'TFA-002', size: 'small', status: 'unassigned', assignedPositionId: null },
  { id: 'plane-003', type: 'fighter', callsign: 'TFA-003', size: 'small', status: 'unassigned', assignedPositionId: null },
  { id: 'plane-004', type: 'fighter', callsign: 'TFA-004', size: 'small', status: 'unassigned', assignedPositionId: null },
  { id: 'plane-005', type: 'bomber', callsign: 'TBB-001', size: 'large', status: 'unassigned', assignedPositionId: null },
  { id: 'plane-006', type: 'bomber', callsign: 'TBB-002', size: 'large', status: 'unassigned', assignedPositionId: null },
  { id: 'plane-007', type: 'transport', callsign: 'TTC-001', size: 'large', status: 'unassigned', assignedPositionId: null },
  { id: 'plane-008', type: 'transport', callsign: 'TTC-002', size: 'large', status: 'unassigned', assignedPositionId: null },
  { id: 'plane-009', type: 'recon', callsign: 'TRD-001', size: 'medium', status: 'unassigned', assignedPositionId: null },
  { id: 'plane-010', type: 'recon', callsign: 'TRD-002', size: 'medium', status: 'unassigned', assignedPositionId: null },
  { id: 'plane-011', type: 'helicopter', callsign: 'THE-001', size: 'small', status: 'unassigned', assignedPositionId: null },
  { id: 'plane-012', type: 'helicopter', callsign: 'THE-002', size: 'small', status: 'unassigned', assignedPositionId: null },
  { id: 'plane-013', type: 'fighter', callsign: 'TFA-005', size: 'small', status: 'maintenance', assignedPositionId: null },
  { id: 'plane-014', type: 'fighter', callsign: 'TFA-006', size: 'small', status: 'unassigned', assignedPositionId: null },
  { id: 'plane-015', type: 'bomber', callsign: 'TBB-003', size: 'large', status: 'unassigned', assignedPositionId: null },
];
