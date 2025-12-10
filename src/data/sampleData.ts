import { Base, Position, Aircraft, Squadron, Shelter, Dome, UpdateInfo } from '@/types/simulation';

// Synthetic sample data for Israeli region (fictionalized coordinates)
// Locations correspond to user-named areas but coordinates are coarse/synthetic

// Helper function to create dates in the past
const createDate = (daysAgo: number, hours: number = 0, minutes: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Sample update info for different users
const updateUsers: UpdateInfo[] = [
  { name: 'יוסי כהן', personalNumber: '1234567', phone: '050-1234567' },
  { name: 'דני לוי', personalNumber: '2345678', phone: '052-2345678' },
  { name: 'מיכל אברהם', personalNumber: '3456789', phone: '054-3456789' },
  { name: 'רון דוד', personalNumber: '4567890', phone: '050-4567890' },
  { name: 'שרה ישראלי', personalNumber: '5678901', phone: '052-5678901' },
  { name: 'אלון מזרחי', personalNumber: '6789012', phone: '054-6789012' },
];

export const sampleBases: Base[] = [
  { id: 'base-01', name: 'פלמחים', latitude: 31.93, longitude: 34.72, capacity: 12, metadata: { region: 'Test Region A', status: 'active' } },
  { id: 'base-02', name: 'תל נוף', latitude: 31.82, longitude: 35.1, capacity: 10, metadata: { region: 'Test Region A', status: 'active' } },
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
  { id: 'sq-03', baseId: 'base-02', name: 'טייסת 201', latitude: 31.821, longitude: 35.101 },
  { id: 'sq-04', baseId: 'base-02', name: 'טייסת 202', latitude: 31.819, longitude: 35.097 },
  // גן יבנה
  { id: 'sq-05', baseId: 'base-03', name: 'טייסת 301', latitude: 31.781, longitude: 34.712 },
  // מצפה רמון
  { id: 'sq-06', baseId: 'base-04', name: 'טייסת 401', latitude: 30.612, longitude: 34.801 },
  // רמת דוד
  { id: 'sq-07', baseId: 'base-05', name: 'טייסת 501', latitude: 32.701, longitude: 35.181 },
  { id: 'sq-08', baseId: 'base-05', name: 'טייסת 502', latitude: 32.699, longitude: 35.179 },
  // טייסות נוספות
  { id: 'sq-09', baseId: 'base-01', name: 'טייסת 103', latitude: 31.927, longitude: 34.716 },
  { id: 'sq-10', baseId: 'base-02', name: 'טייסת 203', latitude: 31.817, longitude: 35.095 },
];

// דתקים - כל טייסת יש לה דתקים, כל דתק מייצג סוג מטוס/מסוק מסוים
// הגדלת המרחק בין דתקים כדי שיהיו יותר מרווחים בזום
export const sampleShelters: Shelter[] = [
  // טייסת 101 - מטוסי קרב (fighter) - בסיס פלמחים (31.93, 34.72)
  { id: 'sh-01', squadronId: 'sq-01', name: 'דתק 1', latitude: 31.9360, longitude: 34.7260, aircraftType: 'fighter', lastUpdated: createDate(2, 14, 30), updatedBy: updateUsers[0] },
  { id: 'sh-02', squadronId: 'sq-01', name: 'דתק 2', latitude: 31.9320, longitude: 34.7220, aircraftType: 'fighter', lastUpdated: createDate(1, 10, 15), updatedBy: updateUsers[1] },
  { id: 'sh-03', squadronId: 'sq-01', name: 'דתק 3', latitude: 31.9400, longitude: 34.7300, aircraftType: 'fighter', lastUpdated: createDate(3, 16, 45), updatedBy: updateUsers[2] },
  // טייסת 102 - מטוסי הפצצה (bomber) - בסיס פלמחים
  { id: 'sh-04', squadronId: 'sq-02', name: 'דתק 1', latitude: 31.9280, longitude: 34.7180, aircraftType: 'bomber', lastUpdated: createDate(1, 9, 20), updatedBy: updateUsers[0] },
  { id: 'sh-05', squadronId: 'sq-02', name: 'דתק 2', latitude: 31.9240, longitude: 34.7140, aircraftType: 'bomber', lastUpdated: createDate(2, 11, 0), updatedBy: updateUsers[3] },
  // טייסת 201 - מטוסי תובלה (transport) - בסיס תל נוף (31.82, 35.1)
  { id: 'sh-06', squadronId: 'sq-03', name: 'דתק 1', latitude: 31.8260, longitude: 35.1060, aircraftType: 'transport', lastUpdated: createDate(0, 8, 30), updatedBy: updateUsers[1] },
  { id: 'sh-07', squadronId: 'sq-03', name: 'דתק 2', latitude: 31.8220, longitude: 35.1020, aircraftType: 'transport', lastUpdated: createDate(1, 13, 10), updatedBy: updateUsers[4] },
  { id: 'sh-08', squadronId: 'sq-03', name: 'דתק 3', latitude: 31.8180, longitude: 35.0980, aircraftType: 'transport', lastUpdated: createDate(2, 15, 25), updatedBy: updateUsers[5] },
  // טייסת 202 - מטוסי סיור (recon) - בסיס תל נוף
  { id: 'sh-09', squadronId: 'sq-04', name: 'דתק 1', latitude: 31.8280, longitude: 35.1020, aircraftType: 'recon', lastUpdated: createDate(1, 12, 0), updatedBy: updateUsers[2] },
  { id: 'sh-10', squadronId: 'sq-04', name: 'דתק 2', latitude: 31.8240, longitude: 35.0980, aircraftType: 'recon', lastUpdated: createDate(0, 7, 45), updatedBy: updateUsers[0] },
  // טייסת 301 - מסוקים (helicopter)
  { id: 'sh-11', squadronId: 'sq-05', name: 'דתק 1', latitude: 31.7860, longitude: 34.7170, aircraftType: 'helicopter', lastUpdated: createDate(2, 10, 15), updatedBy: updateUsers[3] },
  { id: 'sh-12', squadronId: 'sq-05', name: 'דתק 2', latitude: 31.7780, longitude: 34.7090, aircraftType: 'helicopter', lastUpdated: createDate(1, 14, 30), updatedBy: updateUsers[4] },
  // טייסת 401 - מטוסי קרב (fighter) - טייסת נוספת
  { id: 'sh-13', squadronId: 'sq-06', name: 'דתק 1', latitude: 30.6170, longitude: 34.8060, aircraftType: 'fighter', lastUpdated: createDate(0, 9, 0), updatedBy: updateUsers[5] },
  { id: 'sh-14', squadronId: 'sq-06', name: 'דתק 2', latitude: 30.6090, longitude: 34.7980, aircraftType: 'fighter', lastUpdated: createDate(1, 11, 20), updatedBy: updateUsers[1] },
  // טייסת 501 - מטוסי הפצצה (bomber) - בסיס רמת דוד (32.70, 35.18)
  { id: 'sh-15', squadronId: 'sq-07', name: 'דתק 1', latitude: 32.7040, longitude: 35.1840, aircraftType: 'bomber', lastUpdated: createDate(2, 13, 0), updatedBy: updateUsers[2] },
  { id: 'sh-16', squadronId: 'sq-07', name: 'דתק 2', latitude: 32.7000, longitude: 35.1800, aircraftType: 'bomber', lastUpdated: createDate(1, 15, 45), updatedBy: updateUsers[3] },
  { id: 'sh-17', squadronId: 'sq-07', name: 'דתק 3', latitude: 32.7080, longitude: 35.1880, aircraftType: 'bomber', lastUpdated: createDate(0, 10, 10), updatedBy: updateUsers[4] },
  // טייסת 502 - מסוקים (helicopter) - בסיס רמת דוד
  { id: 'sh-18', squadronId: 'sq-08', name: 'דתק 1', latitude: 32.7100, longitude: 35.1900, aircraftType: 'helicopter', lastUpdated: createDate(1, 8, 15), updatedBy: updateUsers[5] },
  { id: 'sh-19', squadronId: 'sq-08', name: 'דתק 2', latitude: 32.7060, longitude: 35.1860, aircraftType: 'helicopter', lastUpdated: createDate(2, 12, 30), updatedBy: updateUsers[0] },
  // טייסת 103 - מטוסי קרב נוספים (fighter) - בסיס פלמחים
  { id: 'sh-20', squadronId: 'sq-09', name: 'דתק 1', latitude: 31.9380, longitude: 34.7200, aircraftType: 'fighter', lastUpdated: createDate(0, 11, 30), updatedBy: updateUsers[1] },
  { id: 'sh-21', squadronId: 'sq-09', name: 'דתק 2', latitude: 31.9340, longitude: 34.7160, aircraftType: 'fighter', lastUpdated: createDate(1, 9, 45), updatedBy: updateUsers[2] },
  // טייסת 203 - מטוסי תובלה נוספים (transport) - בסיס תל נוף
  { id: 'sh-22', squadronId: 'sq-10', name: 'דתק 1', latitude: 31.8160, longitude: 35.0960, aircraftType: 'transport', lastUpdated: createDate(0, 10, 15), updatedBy: updateUsers[3] },
  { id: 'sh-23', squadronId: 'sq-10', name: 'דתק 2', latitude: 31.8120, longitude: 35.0920, aircraftType: 'transport', lastUpdated: createDate(1, 12, 20), updatedBy: updateUsers[4] },
];

// כיפות - כל דתק יש לו כיפות (ממוקמות סביב הדתק)
// הכיפות ממוקמות בצורה מאורגנת סביב כל דתק
export const sampleDomes: Dome[] = [
  // דתק 1 של טייסת 101 (sh-01) - 4 כיפות
  { id: 'dome-01', shelterId: 'sh-01', name: 'כיפה 1', latitude: 31.9317, longitude: 34.7227, aircraftId: 'plane-001', lastUpdated: createDate(0, 8, 15), updatedBy: updateUsers[0] },
  { id: 'dome-02', shelterId: 'sh-01', name: 'כיפה 2', latitude: 31.9313, longitude: 34.7223, aircraftId: 'plane-002', lastUpdated: createDate(0, 8, 20), updatedBy: updateUsers[0] },
  { id: 'dome-03', shelterId: 'sh-01', name: 'כיפה 3', latitude: 31.9319, longitude: 34.7229, aircraftId: null, lastUpdated: createDate(1, 10, 0), updatedBy: updateUsers[1] },
  { id: 'dome-04', shelterId: 'sh-01', name: 'כיפה 4', latitude: 31.9315, longitude: 34.7231, aircraftId: null, lastUpdated: createDate(2, 14, 30), updatedBy: updateUsers[2] },
  // דתק 2 של טייסת 101 (sh-02) - 3 כיפות
  { id: 'dome-05', shelterId: 'sh-02', name: 'כיפה 1', latitude: 31.9307, longitude: 34.7217, aircraftId: 'plane-003', lastUpdated: createDate(0, 9, 30), updatedBy: updateUsers[1] },
  { id: 'dome-06', shelterId: 'sh-02', name: 'כיפה 2', latitude: 31.9303, longitude: 34.7213, aircraftId: null, lastUpdated: createDate(1, 11, 15), updatedBy: updateUsers[3] },
  { id: 'dome-07', shelterId: 'sh-02', name: 'כיפה 3', latitude: 31.9309, longitude: 34.7219, aircraftId: null, lastUpdated: createDate(2, 13, 45), updatedBy: updateUsers[4] },
  // דתק 3 של טייסת 101 (sh-03) - 4 כיפות
  { id: 'dome-08', shelterId: 'sh-03', name: 'כיפה 1', latitude: 31.9327, longitude: 34.7237, aircraftId: null, lastUpdated: createDate(1, 12, 0), updatedBy: updateUsers[2] },
  { id: 'dome-09', shelterId: 'sh-03', name: 'כיפה 2', latitude: 31.9323, longitude: 34.7233, aircraftId: null, lastUpdated: createDate(2, 15, 30), updatedBy: updateUsers[5] },
  { id: 'dome-10', shelterId: 'sh-03', name: 'כיפה 3', latitude: 31.9329, longitude: 34.7239, aircraftId: null, lastUpdated: createDate(0, 7, 20), updatedBy: updateUsers[0] },
  { id: 'dome-11', shelterId: 'sh-03', name: 'כיפה 4', latitude: 31.9325, longitude: 34.7241, aircraftId: null, lastUpdated: createDate(1, 9, 10), updatedBy: updateUsers[1] },
  // דתק 1 של טייסת 102 (sh-04) - 3 כיפות
  { id: 'dome-12', shelterId: 'sh-04', name: 'כיפה 1', latitude: 31.9297, longitude: 34.7187, aircraftId: 'plane-004', lastUpdated: createDate(0, 10, 45), updatedBy: updateUsers[3] },
  { id: 'dome-13', shelterId: 'sh-04', name: 'כיפה 2', latitude: 31.9293, longitude: 34.7183, aircraftId: null, lastUpdated: createDate(1, 13, 30), updatedBy: updateUsers[4] },
  { id: 'dome-14', shelterId: 'sh-04', name: 'כיפה 3', latitude: 31.9299, longitude: 34.7189, aircraftId: null, lastUpdated: createDate(2, 16, 0), updatedBy: updateUsers[5] },
  // דתק 2 של טייסת 102 (sh-05) - 4 כיפות
  { id: 'dome-15', shelterId: 'sh-05', name: 'כיפה 1', latitude: 31.9287, longitude: 34.7177, aircraftId: null, lastUpdated: createDate(0, 8, 0), updatedBy: updateUsers[0] },
  { id: 'dome-16', shelterId: 'sh-05', name: 'כיפה 2', latitude: 31.9283, longitude: 34.7173, aircraftId: null, lastUpdated: createDate(1, 10, 20), updatedBy: updateUsers[1] },
  { id: 'dome-17', shelterId: 'sh-05', name: 'כיפה 3', latitude: 31.9289, longitude: 34.7179, aircraftId: null, lastUpdated: createDate(2, 14, 10), updatedBy: updateUsers[2] },
  { id: 'dome-18', shelterId: 'sh-05', name: 'כיפה 4', latitude: 31.9285, longitude: 34.7181, aircraftId: null, lastUpdated: createDate(0, 9, 15), updatedBy: updateUsers[3] },
  // דתק 1 של טייסת 201 (sh-06) - 4 כיפות
  { id: 'dome-19', shelterId: 'sh-06', name: 'כיפה 1', latitude: 31.8217, longitude: 34.8917, aircraftId: 'plane-005', lastUpdated: createDate(0, 11, 0), updatedBy: updateUsers[4] },
  { id: 'dome-20', shelterId: 'sh-06', name: 'כיפה 2', latitude: 31.8213, longitude: 34.8913, aircraftId: 'plane-006', lastUpdated: createDate(0, 11, 5), updatedBy: updateUsers[4] },
  { id: 'dome-21', shelterId: 'sh-06', name: 'כיפה 3', latitude: 31.8219, longitude: 34.8919, aircraftId: null, lastUpdated: createDate(1, 14, 40), updatedBy: updateUsers[5] },
  { id: 'dome-22', shelterId: 'sh-06', name: 'כיפה 4', latitude: 31.8215, longitude: 34.8921, aircraftId: null, lastUpdated: createDate(2, 16, 20), updatedBy: updateUsers[0] },
  // דתק 2 של טייסת 201 (sh-07) - 3 כיפות
  { id: 'dome-23', shelterId: 'sh-07', name: 'כיפה 1', latitude: 31.8207, longitude: 34.8907, aircraftId: null, lastUpdated: createDate(0, 7, 30), updatedBy: updateUsers[1] },
  { id: 'dome-24', shelterId: 'sh-07', name: 'כיפה 2', latitude: 31.8203, longitude: 34.8903, aircraftId: null, lastUpdated: createDate(1, 9, 25), updatedBy: updateUsers[2] },
  { id: 'dome-25', shelterId: 'sh-07', name: 'כיפה 3', latitude: 31.8209, longitude: 34.8909, aircraftId: null, lastUpdated: createDate(2, 12, 15), updatedBy: updateUsers[3] },
  // דתק 3 של טייסת 201 (sh-08) - 4 כיפות
  { id: 'dome-26', shelterId: 'sh-08', name: 'כיפה 1', latitude: 31.8227, longitude: 34.8927, aircraftId: null, lastUpdated: createDate(0, 8, 45), updatedBy: updateUsers[4] },
  { id: 'dome-27', shelterId: 'sh-08', name: 'כיפה 2', latitude: 31.8223, longitude: 34.8923, aircraftId: null, lastUpdated: createDate(1, 11, 50), updatedBy: updateUsers[5] },
  { id: 'dome-28', shelterId: 'sh-08', name: 'כיפה 3', latitude: 31.8229, longitude: 34.8929, aircraftId: null, lastUpdated: createDate(2, 15, 5), updatedBy: updateUsers[0] },
  { id: 'dome-29', shelterId: 'sh-08', name: 'כיפה 4', latitude: 31.8225, longitude: 34.8931, aircraftId: null, lastUpdated: createDate(0, 10, 30), updatedBy: updateUsers[1] },
  // דתק 1 של טייסת 202 (sh-09) - 3 כיפות
  { id: 'dome-30', shelterId: 'sh-09', name: 'כיפה 1', latitude: 31.8197, longitude: 34.8877, aircraftId: 'plane-007', lastUpdated: createDate(0, 9, 0), updatedBy: updateUsers[2] },
  { id: 'dome-31', shelterId: 'sh-09', name: 'כיפה 2', latitude: 31.8193, longitude: 34.8873, aircraftId: null, lastUpdated: createDate(1, 12, 35), updatedBy: updateUsers[3] },
  { id: 'dome-32', shelterId: 'sh-09', name: 'כיפה 3', latitude: 31.8199, longitude: 34.8879, aircraftId: null, lastUpdated: createDate(2, 14, 50), updatedBy: updateUsers[4] },
  // דתק 2 של טייסת 202 (sh-10) - 4 כיפות
  { id: 'dome-33', shelterId: 'sh-10', name: 'כיפה 1', latitude: 31.8187, longitude: 34.8867, aircraftId: null, lastUpdated: createDate(0, 7, 15), updatedBy: updateUsers[5] },
  { id: 'dome-34', shelterId: 'sh-10', name: 'כיפה 2', latitude: 31.8183, longitude: 34.8863, aircraftId: null, lastUpdated: createDate(1, 10, 5), updatedBy: updateUsers[0] },
  { id: 'dome-35', shelterId: 'sh-10', name: 'כיפה 3', latitude: 31.8189, longitude: 34.8869, aircraftId: null, lastUpdated: createDate(2, 13, 20), updatedBy: updateUsers[1] },
  { id: 'dome-36', shelterId: 'sh-10', name: 'כיפה 4', latitude: 31.8185, longitude: 34.8871, aircraftId: null, lastUpdated: createDate(0, 8, 30), updatedBy: updateUsers[2] },
  // דתק 1 של טייסת 301 (sh-11) - 3 כיפות
  { id: 'dome-37', shelterId: 'sh-11', name: 'כיפה 1', latitude: 31.7817, longitude: 34.7127, aircraftId: 'plane-008', lastUpdated: createDate(0, 10, 15), updatedBy: updateUsers[3] },
  { id: 'dome-38', shelterId: 'sh-11', name: 'כיפה 2', latitude: 31.7813, longitude: 34.7123, aircraftId: 'plane-009', lastUpdated: createDate(0, 10, 20), updatedBy: updateUsers[3] },
  { id: 'dome-39', shelterId: 'sh-11', name: 'כיפה 3', latitude: 31.7819, longitude: 34.7129, aircraftId: null, lastUpdated: createDate(1, 13, 0), updatedBy: updateUsers[4] },
  // דתק 2 של טייסת 301 (sh-12) - 4 כיפות
  { id: 'dome-40', shelterId: 'sh-12', name: 'כיפה 1', latitude: 31.7807, longitude: 34.7117, aircraftId: null, lastUpdated: createDate(0, 7, 45), updatedBy: updateUsers[5] },
  { id: 'dome-41', shelterId: 'sh-12', name: 'כיפה 2', latitude: 31.7803, longitude: 34.7113, aircraftId: null, lastUpdated: createDate(1, 11, 10), updatedBy: updateUsers[0] },
  { id: 'dome-42', shelterId: 'sh-12', name: 'כיפה 3', latitude: 31.7809, longitude: 34.7119, aircraftId: null, lastUpdated: createDate(2, 15, 40), updatedBy: updateUsers[1] },
  { id: 'dome-43', shelterId: 'sh-12', name: 'כיפה 4', latitude: 31.7805, longitude: 34.7121, aircraftId: null, lastUpdated: createDate(0, 9, 50), updatedBy: updateUsers[2] },
  // דתק 1 של טייסת 401 (sh-13) - 3 כיפות
  { id: 'dome-44', shelterId: 'sh-13', name: 'כיפה 1', latitude: 30.6127, longitude: 34.8017, aircraftId: 'plane-010', lastUpdated: createDate(0, 11, 30), updatedBy: updateUsers[3] },
  { id: 'dome-45', shelterId: 'sh-13', name: 'כיפה 2', latitude: 30.6123, longitude: 34.8013, aircraftId: null, lastUpdated: createDate(1, 14, 15), updatedBy: updateUsers[4] },
  { id: 'dome-46', shelterId: 'sh-13', name: 'כיפה 3', latitude: 30.6129, longitude: 34.8019, aircraftId: null, lastUpdated: createDate(2, 16, 30), updatedBy: updateUsers[5] },
  // דתק 2 של טייסת 401 (sh-14) - 4 כיפות
  { id: 'dome-47', shelterId: 'sh-14', name: 'כיפה 1', latitude: 30.6117, longitude: 34.8007, aircraftId: null, lastUpdated: createDate(0, 8, 20), updatedBy: updateUsers[0] },
  { id: 'dome-48', shelterId: 'sh-14', name: 'כיפה 2', latitude: 30.6113, longitude: 34.8003, aircraftId: null, lastUpdated: createDate(1, 10, 40), updatedBy: updateUsers[1] },
  { id: 'dome-49', shelterId: 'sh-14', name: 'כיפה 3', latitude: 30.6119, longitude: 34.8009, aircraftId: null, lastUpdated: createDate(2, 14, 0), updatedBy: updateUsers[2] },
  { id: 'dome-50', shelterId: 'sh-14', name: 'כיפה 4', latitude: 30.6115, longitude: 34.8011, aircraftId: null, lastUpdated: createDate(0, 9, 35), updatedBy: updateUsers[3] },
  // דתק 1 של טייסת 501 (sh-15) - 4 כיפות
  { id: 'dome-51', shelterId: 'sh-15', name: 'כיפה 1', latitude: 32.7017, longitude: 35.1817, aircraftId: 'plane-011', lastUpdated: createDate(0, 10, 0), updatedBy: updateUsers[4] },
  { id: 'dome-52', shelterId: 'sh-15', name: 'כיפה 2', latitude: 32.7013, longitude: 35.1813, aircraftId: 'plane-012', lastUpdated: createDate(0, 10, 5), updatedBy: updateUsers[4] },
  { id: 'dome-53', shelterId: 'sh-15', name: 'כיפה 3', latitude: 32.7019, longitude: 35.1819, aircraftId: null, lastUpdated: createDate(1, 12, 50), updatedBy: updateUsers[5] },
  { id: 'dome-54', shelterId: 'sh-15', name: 'כיפה 4', latitude: 32.7015, longitude: 35.1821, aircraftId: null, lastUpdated: createDate(2, 15, 15), updatedBy: updateUsers[0] },
  // דתק 2 של טייסת 501 (sh-16) - 3 כיפות
  { id: 'dome-55', shelterId: 'sh-16', name: 'כיפה 1', latitude: 32.7007, longitude: 35.1807, aircraftId: null, lastUpdated: createDate(0, 7, 50), updatedBy: updateUsers[1] },
  { id: 'dome-56', shelterId: 'sh-16', name: 'כיפה 2', latitude: 32.7003, longitude: 35.1803, aircraftId: null, lastUpdated: createDate(1, 11, 25), updatedBy: updateUsers[2] },
  { id: 'dome-57', shelterId: 'sh-16', name: 'כיפה 3', latitude: 32.7009, longitude: 35.1809, aircraftId: null, lastUpdated: createDate(2, 13, 35), updatedBy: updateUsers[3] },
  // דתק 3 של טייסת 501 (sh-17) - 4 כיפות
  { id: 'dome-58', shelterId: 'sh-17', name: 'כיפה 1', latitude: 32.7027, longitude: 35.1827, aircraftId: null, lastUpdated: createDate(0, 8, 10), updatedBy: updateUsers[4] },
  { id: 'dome-59', shelterId: 'sh-17', name: 'כיפה 2', latitude: 32.7023, longitude: 35.1823, aircraftId: null, lastUpdated: createDate(1, 10, 55), updatedBy: updateUsers[5] },
  { id: 'dome-60', shelterId: 'sh-17', name: 'כיפה 3', latitude: 32.7029, longitude: 35.1829, aircraftId: null, lastUpdated: createDate(2, 14, 25), updatedBy: updateUsers[0] },
  { id: 'dome-61', shelterId: 'sh-17', name: 'כיפה 4', latitude: 32.7025, longitude: 35.1831, aircraftId: null, lastUpdated: createDate(0, 9, 40), updatedBy: updateUsers[1] },
  // דתק 1 של טייסת 502 (sh-18) - 3 כיפות
  { id: 'dome-62', shelterId: 'sh-18', name: 'כיפה 1', latitude: 32.6997, longitude: 35.1797, aircraftId: 'plane-013', lastUpdated: createDate(0, 11, 15), updatedBy: updateUsers[2] },
  { id: 'dome-63', shelterId: 'sh-18', name: 'כיפה 2', latitude: 32.6993, longitude: 35.1793, aircraftId: 'plane-014', lastUpdated: createDate(0, 11, 20), updatedBy: updateUsers[2] },
  { id: 'dome-64', shelterId: 'sh-18', name: 'כיפה 3', latitude: 32.6999, longitude: 35.1799, aircraftId: 'plane-015', lastUpdated: createDate(0, 11, 25), updatedBy: updateUsers[2] },
  // דתק 2 של טייסת 502 (sh-19) - 4 כיפות
  { id: 'dome-65', shelterId: 'sh-19', name: 'כיפה 1', latitude: 32.6987, longitude: 35.1787, aircraftId: null, lastUpdated: createDate(0, 7, 25), updatedBy: updateUsers[3] },
  { id: 'dome-66', shelterId: 'sh-19', name: 'כיפה 2', latitude: 32.6983, longitude: 35.1783, aircraftId: null, lastUpdated: createDate(1, 11, 5), updatedBy: updateUsers[4] },
  { id: 'dome-67', shelterId: 'sh-19', name: 'כיפה 3', latitude: 32.6989, longitude: 35.1789, aircraftId: null, lastUpdated: createDate(2, 13, 50), updatedBy: updateUsers[5] },
  { id: 'dome-68', shelterId: 'sh-19', name: 'כיפה 4', latitude: 32.6985, longitude: 35.1791, aircraftId: null, lastUpdated: createDate(0, 8, 55), updatedBy: updateUsers[0] },
  // דתק 1 של טייסת 103 (sh-20) - 4 כיפות
  { id: 'dome-69', shelterId: 'sh-20', name: 'כיפה 1', latitude: 31.9277, longitude: 34.7167, aircraftId: null, lastUpdated: createDate(0, 9, 0), updatedBy: updateUsers[1] },
  { id: 'dome-70', shelterId: 'sh-20', name: 'כיפה 2', latitude: 31.9273, longitude: 34.7163, aircraftId: null, lastUpdated: createDate(1, 10, 15), updatedBy: updateUsers[2] },
  { id: 'dome-71', shelterId: 'sh-20', name: 'כיפה 3', latitude: 31.9279, longitude: 34.7169, aircraftId: null, lastUpdated: createDate(2, 12, 30), updatedBy: updateUsers[3] },
  { id: 'dome-72', shelterId: 'sh-20', name: 'כיפה 4', latitude: 31.9275, longitude: 34.7171, aircraftId: null, lastUpdated: createDate(0, 8, 20), updatedBy: updateUsers[4] },
  // דתק 2 של טייסת 103 (sh-21) - 3 כיפות
  { id: 'dome-73', shelterId: 'sh-21', name: 'כיפה 1', latitude: 31.9267, longitude: 34.7157, aircraftId: null, lastUpdated: createDate(1, 11, 0), updatedBy: updateUsers[5] },
  { id: 'dome-74', shelterId: 'sh-21', name: 'כיפה 2', latitude: 31.9263, longitude: 34.7153, aircraftId: null, lastUpdated: createDate(0, 9, 30), updatedBy: updateUsers[0] },
  { id: 'dome-75', shelterId: 'sh-21', name: 'כיפה 3', latitude: 31.9269, longitude: 34.7159, aircraftId: null, lastUpdated: createDate(1, 13, 45), updatedBy: updateUsers[1] },
  // דתק 1 של טייסת 203 (sh-22) - 4 כיפות
  { id: 'dome-76', shelterId: 'sh-22', name: 'כיפה 1', latitude: 31.8177, longitude: 34.8857, aircraftId: null, lastUpdated: createDate(0, 10, 30), updatedBy: updateUsers[2] },
  { id: 'dome-77', shelterId: 'sh-22', name: 'כיפה 2', latitude: 31.8173, longitude: 34.8853, aircraftId: null, lastUpdated: createDate(1, 12, 15), updatedBy: updateUsers[3] },
  { id: 'dome-78', shelterId: 'sh-22', name: 'כיפה 3', latitude: 31.8179, longitude: 34.8859, aircraftId: null, lastUpdated: createDate(2, 14, 0), updatedBy: updateUsers[4] },
  { id: 'dome-79', shelterId: 'sh-22', name: 'כיפה 4', latitude: 31.8175, longitude: 34.8861, aircraftId: null, lastUpdated: createDate(0, 7, 40), updatedBy: updateUsers[5] },
  // דתק 2 של טייסת 203 (sh-23) - 3 כיפות
  { id: 'dome-80', shelterId: 'sh-23', name: 'כיפה 1', latitude: 31.8167, longitude: 34.8847, aircraftId: null, lastUpdated: createDate(1, 11, 30), updatedBy: updateUsers[0] },
  { id: 'dome-81', shelterId: 'sh-23', name: 'כיפה 2', latitude: 31.8163, longitude: 34.8843, aircraftId: null, lastUpdated: createDate(0, 8, 10), updatedBy: updateUsers[1] },
  { id: 'dome-82', shelterId: 'sh-23', name: 'כיפה 3', latitude: 31.8169, longitude: 34.8849, aircraftId: null, lastUpdated: createDate(1, 14, 20), updatedBy: updateUsers[2] },
];

export const samplePositions: Position[] = [
  // פלמחים
  { id: 'pos-p1', baseId: 'base-01', name: 'רמפה פלמחים 1', latitude: 31.931, longitude: 34.723, type: 'apron', capacity: 3 },
  { id: 'pos-p2', baseId: 'base-01', name: 'האגר פלמחים 2', latitude: 31.929, longitude: 34.718, type: 'hangar', capacity: 2 },
  // תל נוף
  { id: 'pos-t1', baseId: 'base-02', name: 'רמפה תל נוף 1', latitude: 31.821, longitude: 35.103, type: 'apron', capacity: 3 },
  { id: 'pos-t2', baseId: 'base-02', name: 'האגר תל נוף 2', latitude: 31.819, longitude: 35.095, type: 'hangar', capacity: 4 },
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
  // דתק 1 של טייסת 101 (sh-01) - dome-01 עד dome-04 - מטוסי קרב
  { id: 'plane-001', type: 'fighter', callsign: 'TFA-001', size: 'small', status: 'assigned', location: 'ground', assignedPositionId: null, assignedDomeId: 'dome-01', lastStatusUpdate: createDate(0, 8, 15), lastStatusUpdatedBy: updateUsers[0] },
  { id: 'plane-002', type: 'fighter', callsign: 'TFA-002', size: 'small', status: 'assigned', location: 'air', assignedPositionId: null, assignedDomeId: 'dome-02', lastStatusUpdate: createDate(0, 7, 30), lastStatusUpdatedBy: updateUsers[1] },
  // מטוסים שמוקצים לכיפות ריקות - נחשבים באוויר
  { id: 'plane-021', type: 'fighter', callsign: 'TFA-007', size: 'small', status: 'assigned', location: 'ground', assignedPositionId: null, assignedDomeId: 'dome-03', lastStatusUpdate: createDate(1, 10, 0), lastStatusUpdatedBy: updateUsers[1] }, // כיפה ריקה - נחשב באוויר
  { id: 'plane-022', type: 'fighter', callsign: 'TFA-008', size: 'small', status: 'assigned', location: 'ground', assignedPositionId: null, assignedDomeId: 'dome-04', lastStatusUpdate: createDate(2, 14, 30), lastStatusUpdatedBy: updateUsers[2] }, // כיפה ריקה - נחשב באוויר
  // דתק 2 של טייסת 101 (sh-02) - dome-05 עד dome-07 - מטוסי קרב
  { id: 'plane-003', type: 'fighter', callsign: 'TFA-003', size: 'small', status: 'assigned', location: 'ground', assignedPositionId: null, assignedDomeId: 'dome-05', lastStatusUpdate: createDate(0, 9, 0), lastStatusUpdatedBy: updateUsers[2] },
  { id: 'plane-023', type: 'fighter', callsign: 'TFA-009', size: 'small', status: 'assigned', location: 'ground', assignedPositionId: null, assignedDomeId: 'dome-06', lastStatusUpdate: createDate(1, 11, 15), lastStatusUpdatedBy: updateUsers[3] }, // כיפה ריקה - נחשב באוויר
  // דתק 1 של טייסת 102 (sh-04) - dome-12 עד dome-14 - מטוסי הפצצה
  { id: 'plane-004', type: 'bomber', callsign: 'TBB-001', size: 'large', status: 'assigned', location: 'air', assignedPositionId: null, assignedDomeId: 'dome-12', lastStatusUpdate: createDate(0, 6, 45), lastStatusUpdatedBy: updateUsers[3] },
  // דתק 1 של טייסת 201 (sh-06) - dome-19 עד dome-22 - מטוסי תובלה
  { id: 'plane-005', type: 'transport', callsign: 'TTC-001', size: 'large', status: 'assigned', location: 'ground', assignedPositionId: null, assignedDomeId: 'dome-19', lastStatusUpdate: createDate(0, 10, 20), lastStatusUpdatedBy: updateUsers[4] },
  { id: 'plane-006', type: 'transport', callsign: 'TTC-002', size: 'large', status: 'assigned', location: 'ground', assignedPositionId: null, assignedDomeId: 'dome-20', lastStatusUpdate: createDate(0, 10, 25), lastStatusUpdatedBy: updateUsers[4] },
  // דתק 1 של טייסת 202 (sh-09) - dome-30 עד dome-32 - מטוסי סיור
  { id: 'plane-007', type: 'recon', callsign: 'TRD-001', size: 'medium', status: 'assigned', location: 'air', assignedPositionId: null, assignedDomeId: 'dome-30', lastStatusUpdate: createDate(0, 5, 15), lastStatusUpdatedBy: updateUsers[5] },
  // דתק 1 של טייסת 301 (sh-11) - dome-37 עד dome-39 - מסוקים
  { id: 'plane-008', type: 'helicopter', callsign: 'THE-001', size: 'small', status: 'assigned', location: 'ground', assignedPositionId: null, assignedDomeId: 'dome-37', lastStatusUpdate: createDate(0, 11, 0), lastStatusUpdatedBy: updateUsers[0] },
  { id: 'plane-009', type: 'helicopter', callsign: 'THE-002', size: 'small', status: 'assigned', location: 'air', assignedPositionId: null, assignedDomeId: 'dome-38', lastStatusUpdate: createDate(0, 4, 30), lastStatusUpdatedBy: updateUsers[1] },
  // דתק 1 של טייסת 401 (sh-13) - dome-44 עד dome-46 - מטוסי קרב
  { id: 'plane-010', type: 'fighter', callsign: 'TFA-004', size: 'small', status: 'assigned', location: 'ground', assignedPositionId: null, assignedDomeId: 'dome-44', lastStatusUpdate: createDate(0, 9, 45), lastStatusUpdatedBy: updateUsers[2] },
  // דתק 1 של טייסת 501 (sh-15) - dome-51 עד dome-54 - מטוסי הפצצה
  { id: 'plane-011', type: 'bomber', callsign: 'TBB-002', size: 'large', status: 'assigned', location: 'air', assignedPositionId: null, assignedDomeId: 'dome-51', lastStatusUpdate: createDate(0, 3, 20), lastStatusUpdatedBy: updateUsers[3] },
  { id: 'plane-012', type: 'bomber', callsign: 'TBB-003', size: 'large', status: 'assigned', location: 'ground', assignedPositionId: null, assignedDomeId: 'dome-52', lastStatusUpdate: createDate(0, 8, 10), lastStatusUpdatedBy: updateUsers[4] },
  // דתק 1 של טייסת 502 (sh-18) - dome-62 עד dome-64 - מסוקים
  { id: 'plane-013', type: 'helicopter', callsign: 'THE-003', size: 'small', status: 'maintenance', location: 'ground', assignedPositionId: null, assignedDomeId: 'dome-62', lastStatusUpdate: createDate(1, 14, 0), lastStatusUpdatedBy: updateUsers[5] },
  { id: 'plane-014', type: 'helicopter', callsign: 'THE-004', size: 'small', status: 'assigned', location: 'air', assignedPositionId: null, assignedDomeId: 'dome-63', lastStatusUpdate: createDate(0, 2, 15), lastStatusUpdatedBy: updateUsers[0] },
  { id: 'plane-015', type: 'helicopter', callsign: 'THE-005', size: 'small', status: 'assigned', location: 'ground', assignedPositionId: null, assignedDomeId: 'dome-64', lastStatusUpdate: createDate(0, 7, 50), lastStatusUpdatedBy: updateUsers[1] },
  // מטוסים חשודים (מיקום לא מעודכן) - אין להם כיפה מוקצית
  { id: 'plane-016', type: 'fighter', callsign: 'TFA-005', size: 'small', status: 'assigned', location: 'air', locationUncertain: true, uncertainLatitude: 31.95, uncertainLongitude: 34.75, assignedPositionId: null, assignedDomeId: null, lastStatusUpdate: createDate(2, 10, 0), lastStatusUpdatedBy: updateUsers[2] },
  { id: 'plane-017', type: 'fighter', callsign: 'TFA-006', size: 'small', status: 'assigned', location: 'ground', locationUncertain: true, uncertainLatitude: 31.88, uncertainLongitude: 34.85, assignedPositionId: null, assignedDomeId: null, lastStatusUpdate: createDate(3, 8, 30), lastStatusUpdatedBy: updateUsers[3] },
  { id: 'plane-018', type: 'bomber', callsign: 'TBB-004', size: 'large', status: 'assigned', location: 'air', locationUncertain: true, uncertainLatitude: 31.75, uncertainLongitude: 34.70, assignedPositionId: null, assignedDomeId: null, lastStatusUpdate: createDate(1, 15, 45), lastStatusUpdatedBy: updateUsers[4] },
  { id: 'plane-019', type: 'transport', callsign: 'TTC-003', size: 'large', status: 'assigned', location: 'ground', locationUncertain: true, uncertainLatitude: 32.65, uncertainLongitude: 35.15, assignedPositionId: null, assignedDomeId: null, lastStatusUpdate: createDate(2, 12, 20), lastStatusUpdatedBy: updateUsers[5] },
  { id: 'plane-020', type: 'recon', callsign: 'TRD-002', size: 'medium', status: 'assigned', location: 'air', locationUncertain: true, uncertainLatitude: 30.70, uncertainLongitude: 34.85, assignedPositionId: null, assignedDomeId: null, lastStatusUpdate: createDate(1, 9, 15), lastStatusUpdatedBy: updateUsers[0] },
];
