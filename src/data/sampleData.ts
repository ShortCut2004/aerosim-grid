import { Base, Position, Aircraft, Squadron, Shelter, Dome } from '@/types/simulation';

// Synthetic sample data for Israeli region (fictionalized coordinates)
// Locations correspond to user-named areas but coordinates are coarse/synthetic

export const sampleBases: Base[] = [
  { id: 'base-01', name: 'פלמחים', latitude: 31.93, longitude: 34.72, capacity: 12, metadata: { region: 'Test Region A', status: 'active' } },
  { id: 'base-02', name: 'תל נוף', latitude: 31.82, longitude: 34.89, capacity: 10, metadata: { region: 'Test Region A', status: 'active' } },
  { id: 'base-03', name: 'גן יבנה', latitude: 31.78, longitude: 34.71, capacity: 8, metadata: { region: 'Test Region A', status: 'active' } },
  { id: 'base-04', name: 'מצפה רמון', latitude: 30.61, longitude: 34.80, capacity: 6, metadata: { region: 'Test Region A', status: 'active' } },
  { id: 'base-05', name: 'רמת דוד', latitude: 32.70, longitude: 35.18, capacity: 14, metadata: { region: 'Test Region A', status: 'active' } },
];

// טייסות - כל בסיס יש לו טייסות
export const sampleSquadrons: Squadron[] = [
  // פלמחים
  { id: 'sq-01', baseId: 'base-01', name: 'טייסת 101', latitude: 31.931, longitude: 34.722 },
  { id: 'sq-02', baseId: 'base-01', name: 'טייסת 102', latitude: 31.929, longitude: 34.718 },
  // תל נוף
  { id: 'sq-03', baseId: 'base-02', name: 'טייסת 201', latitude: 31.821, longitude: 34.891 },
  { id: 'sq-04', baseId: 'base-02', name: 'טייסת 202', latitude: 31.819, longitude: 34.887 },
  // גן יבנה
  { id: 'sq-05', baseId: 'base-03', name: 'טייסת 301', latitude: 31.781, longitude: 34.712 },
  // מצפה רמון
  { id: 'sq-06', baseId: 'base-04', name: 'טייסת 401', latitude: 30.612, longitude: 34.801 },
  // רמת דוד
  { id: 'sq-07', baseId: 'base-05', name: 'טייסת 501', latitude: 32.701, longitude: 35.181 },
  { id: 'sq-08', baseId: 'base-05', name: 'טייסת 502', latitude: 32.699, longitude: 35.179 },
];

// דתקים - כל טייסת יש לה דתקים
export const sampleShelters: Shelter[] = [
  // טייסת 101
  { id: 'sh-01', squadronId: 'sq-01', name: 'דתק 1', latitude: 31.9315, longitude: 34.7225 },
  { id: 'sh-02', squadronId: 'sq-01', name: 'דתק 2', latitude: 31.9305, longitude: 34.7215 },
  // טייסת 102
  { id: 'sh-03', squadronId: 'sq-02', name: 'דתק 1', latitude: 31.9295, longitude: 34.7185 },
  // טייסת 201
  { id: 'sh-04', squadronId: 'sq-03', name: 'דתק 1', latitude: 31.8215, longitude: 34.8915 },
  { id: 'sh-05', squadronId: 'sq-03', name: 'דתק 2', latitude: 31.8205, longitude: 34.8905 },
  // טייסת 202
  { id: 'sh-06', squadronId: 'sq-04', name: 'דתק 1', latitude: 31.8195, longitude: 34.8875 },
  // טייסת 301
  { id: 'sh-07', squadronId: 'sq-05', name: 'דתק 1', latitude: 31.7815, longitude: 34.7125 },
  // טייסת 401
  { id: 'sh-08', squadronId: 'sq-06', name: 'דתק 1', latitude: 30.6125, longitude: 34.8015 },
  // טייסת 501
  { id: 'sh-09', squadronId: 'sq-07', name: 'דתק 1', latitude: 32.7015, longitude: 35.1815 },
  { id: 'sh-10', squadronId: 'sq-07', name: 'דתק 2', latitude: 32.7005, longitude: 35.1805 },
  // טייסת 502
  { id: 'sh-11', squadronId: 'sq-08', name: 'דתק 1', latitude: 32.6995, longitude: 35.1795 },
];

// כיפות - כל דתק יש לו כיפות
export const sampleDomes: Dome[] = [
  // דתק 1 של טייסת 101
  { id: 'dome-01', shelterId: 'sh-01', name: 'כיפה 1', latitude: 31.9317, longitude: 34.7227, aircraftId: 'plane-001' },
  { id: 'dome-02', shelterId: 'sh-01', name: 'כיפה 2', latitude: 31.9313, longitude: 34.7223, aircraftId: 'plane-002' },
  { id: 'dome-03', shelterId: 'sh-01', name: 'כיפה 3', latitude: 31.9319, longitude: 34.7229, aircraftId: null },
  // דתק 2 של טייסת 101
  { id: 'dome-04', shelterId: 'sh-02', name: 'כיפה 1', latitude: 31.9307, longitude: 34.7217, aircraftId: 'plane-003' },
  { id: 'dome-05', shelterId: 'sh-02', name: 'כיפה 2', latitude: 31.9303, longitude: 34.7213, aircraftId: null },
  // דתק 1 של טייסת 102
  { id: 'dome-06', shelterId: 'sh-03', name: 'כיפה 1', latitude: 31.9297, longitude: 34.7187, aircraftId: 'plane-004' },
  { id: 'dome-07', shelterId: 'sh-03', name: 'כיפה 2', latitude: 31.9293, longitude: 34.7183, aircraftId: null },
  // דתק 1 של טייסת 201
  { id: 'dome-08', shelterId: 'sh-04', name: 'כיפה 1', latitude: 31.8217, longitude: 34.8917, aircraftId: 'plane-005' },
  { id: 'dome-09', shelterId: 'sh-04', name: 'כיפה 2', latitude: 31.8213, longitude: 34.8913, aircraftId: 'plane-006' },
  // דתק 2 של טייסת 201
  { id: 'dome-10', shelterId: 'sh-05', name: 'כיפה 1', latitude: 31.8207, longitude: 34.8907, aircraftId: null },
  // דתק 1 של טייסת 202
  { id: 'dome-11', shelterId: 'sh-06', name: 'כיפה 1', latitude: 31.8197, longitude: 34.8877, aircraftId: 'plane-007' },
  { id: 'dome-12', shelterId: 'sh-06', name: 'כיפה 2', latitude: 31.8193, longitude: 34.8873, aircraftId: null },
  // דתק 1 של טייסת 301
  { id: 'dome-13', shelterId: 'sh-07', name: 'כיפה 1', latitude: 31.7817, longitude: 34.7127, aircraftId: 'plane-008' },
  { id: 'dome-14', shelterId: 'sh-07', name: 'כיפה 2', latitude: 31.7813, longitude: 34.7123, aircraftId: 'plane-009' },
  // דתק 1 של טייסת 401
  { id: 'dome-15', shelterId: 'sh-08', name: 'כיפה 1', latitude: 30.6127, longitude: 34.8017, aircraftId: 'plane-010' },
  { id: 'dome-16', shelterId: 'sh-08', name: 'כיפה 2', latitude: 30.6123, longitude: 34.8013, aircraftId: null },
  // דתק 1 של טייסת 501
  { id: 'dome-17', shelterId: 'sh-09', name: 'כיפה 1', latitude: 32.7017, longitude: 35.1817, aircraftId: 'plane-011' },
  { id: 'dome-18', shelterId: 'sh-09', name: 'כיפה 2', latitude: 32.7013, longitude: 35.1813, aircraftId: 'plane-012' },
  // דתק 2 של טייסת 501
  { id: 'dome-19', shelterId: 'sh-10', name: 'כיפה 1', latitude: 32.7007, longitude: 35.1807, aircraftId: null },
  // דתק 1 של טייסת 502
  { id: 'dome-20', shelterId: 'sh-11', name: 'כיפה 1', latitude: 32.6997, longitude: 35.1797, aircraftId: 'plane-013' },
  { id: 'dome-21', shelterId: 'sh-11', name: 'כיפה 2', latitude: 32.6993, longitude: 35.1793, aircraftId: 'plane-014' },
  { id: 'dome-22', shelterId: 'sh-11', name: 'כיפה 3', latitude: 32.6999, longitude: 35.1799, aircraftId: 'plane-015' },
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
  { id: 'plane-001', type: 'fighter', callsign: 'TFA-001', size: 'small', status: 'assigned', assignedPositionId: null, assignedDomeId: 'dome-01' },
  { id: 'plane-002', type: 'fighter', callsign: 'TFA-002', size: 'small', status: 'assigned', assignedPositionId: null, assignedDomeId: 'dome-02' },
  { id: 'plane-003', type: 'fighter', callsign: 'TFA-003', size: 'small', status: 'assigned', assignedPositionId: null, assignedDomeId: 'dome-04' },
  { id: 'plane-004', type: 'fighter', callsign: 'TFA-004', size: 'small', status: 'assigned', assignedPositionId: null, assignedDomeId: 'dome-06' },
  { id: 'plane-005', type: 'bomber', callsign: 'TBB-001', size: 'large', status: 'assigned', assignedPositionId: null, assignedDomeId: 'dome-08' },
  { id: 'plane-006', type: 'bomber', callsign: 'TBB-002', size: 'large', status: 'assigned', assignedPositionId: null, assignedDomeId: 'dome-09' },
  { id: 'plane-007', type: 'transport', callsign: 'TTC-001', size: 'large', status: 'assigned', assignedPositionId: null, assignedDomeId: 'dome-11' },
  { id: 'plane-008', type: 'transport', callsign: 'TTC-002', size: 'large', status: 'assigned', assignedPositionId: null, assignedDomeId: 'dome-13' },
  { id: 'plane-009', type: 'recon', callsign: 'TRD-001', size: 'medium', status: 'assigned', assignedPositionId: null, assignedDomeId: 'dome-14' },
  { id: 'plane-010', type: 'recon', callsign: 'TRD-002', size: 'medium', status: 'assigned', assignedPositionId: null, assignedDomeId: 'dome-15' },
  { id: 'plane-011', type: 'helicopter', callsign: 'THE-001', size: 'small', status: 'assigned', assignedPositionId: null, assignedDomeId: 'dome-17' },
  { id: 'plane-012', type: 'helicopter', callsign: 'THE-002', size: 'small', status: 'assigned', assignedPositionId: null, assignedDomeId: 'dome-18' },
  { id: 'plane-013', type: 'fighter', callsign: 'TFA-005', size: 'small', status: 'maintenance', assignedPositionId: null, assignedDomeId: 'dome-20' },
  { id: 'plane-014', type: 'fighter', callsign: 'TFA-006', size: 'small', status: 'assigned', assignedPositionId: null, assignedDomeId: 'dome-21' },
  { id: 'plane-015', type: 'bomber', callsign: 'TBB-003', size: 'large', status: 'assigned', assignedPositionId: null, assignedDomeId: 'dome-22' },
];
