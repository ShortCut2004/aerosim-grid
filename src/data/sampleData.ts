import { Base, Position, Aircraft } from '@/types/simulation';

// Synthetic sample data for Israeli region (fictionalized coordinates)
// Locations correspond to user-named areas but coordinates are coarse/synthetic

export const sampleBases: Base[] = [
  { id: 'base-01', name: 'פלמחים', latitude: 31.93, longitude: 34.72, capacity: 12, metadata: { region: 'Test Region A', status: 'active' } },
  { id: 'base-02', name: 'תל נוף', latitude: 31.82, longitude: 34.89, capacity: 10, metadata: { region: 'Test Region A', status: 'active' } },
  { id: 'base-03', name: 'גן יבנה', latitude: 31.78, longitude: 34.71, capacity: 8, metadata: { region: 'Test Region A', status: 'active' } },
  { id: 'base-04', name: 'מצפה רמון', latitude: 30.61, longitude: 34.80, capacity: 6, metadata: { region: 'Test Region A', status: 'active' } },
  { id: 'base-05', name: 'רמת דוד', latitude: 32.70, longitude: 35.18, capacity: 14, metadata: { region: 'Test Region A', status: 'active' } },
];

export const samplePositions: Position[] = [
  // פלמחים
  { id: 'pos-p1', baseId: 'base-01', name: 'רמפה פלמחים 1', latitude: 31.931, longitude: 34.723, type: 'apron', capacity: 3 },
  { id: 'pos-p2', baseId: 'base-01', name: 'האגר פלמחים 2', latitude: 31.929, longitude: 34.718, type: 'hangar', capacity: 2 },
  // תל נוף
  { id: 'pos-t1', baseId: 'base-02', name: 'רמפה תל נוף 1', latitude: 31.821, longitude: 34.893, type: 'apron', capacity: 3 },
  { id: 'pos-t2', baseId: 'base-02', name: 'האגר תל נוף 2', latitude: 31.819, longitude: 34.885, type: 'hangar', capacity: 4 },
  // גן יבנה
  { id: 'pos-g1', baseId: 'base-03', name: 'רמפה גן יבנה 1', latitude: 31.781, longitude: 34.713, type: 'apron', capacity: 2 },
  { id: 'pos-g2', baseId: 'base-03', name: 'האגר גן יבנה 2', latitude: 31.779, longitude: 34.707, type: 'hangar', capacity: 2 },
  // מצפה רמון
  { id: 'pos-m1', baseId: 'base-04', name: 'רמפה מצפה רמון 1', latitude: 30.612, longitude: 34.803, type: 'apron', capacity: 2 },
  { id: 'pos-m2', baseId: 'base-04', name: 'האגר מצפה רמון 2', latitude: 30.608, longitude: 34.798, type: 'hangar', capacity: 2 },
  // רמת דוד
  { id: 'pos-r1', baseId: 'base-05', name: 'רמפה רמת דוד 1', latitude: 32.702, longitude: 35.182, type: 'apron', capacity: 3 },
  { id: 'pos-r2', baseId: 'base-05', name: 'האגר רמת דוד 2', latitude: 32.698, longitude: 35.178, type: 'hangar', capacity: 3 },
  { id: 'pos-r3', baseId: 'base-05', name: 'רמפה רמת דוד 3', latitude: 32.705, longitude: 35.187, type: 'apron', capacity: 2 },
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
