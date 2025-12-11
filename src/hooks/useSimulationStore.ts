import { create } from 'zustand';
import { Base, Position, Aircraft, User, PlacementMode, AlgorithmType, AlgorithmParams, Squadron, Shelter, Dome } from '@/types/simulation';
import { sampleBases, samplePositions, sampleAircraft, sampleSquadrons, sampleShelters, sampleDomes } from '@/data/sampleData';

interface SimulationState {
  // Data
  bases: Base[];
  positions: Position[];
  aircraft: Aircraft[];
  squadrons: Squadron[];
  shelters: Shelter[];
  domes: Dome[];
  
  // User & Auth
  currentUser: User | null;
  
  // UI State
  selectedPositionId: string | null;
  selectedAircraftId: string | null;
  placementMode: PlacementMode;
  selectedAlgorithm: AlgorithmType;
  algorithmParams: AlgorithmParams;
  tileLayerUrl: string;
  aircraftFilter: 'all' | 'suspicious' | 'air' | 'ground' | null; // פילטר מטוסים במפה
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  selectPosition: (id: string | null) => void;
  selectAircraft: (id: string | null) => void;
  setPlacementMode: (mode: PlacementMode) => void;
  setSelectedAlgorithm: (algorithm: AlgorithmType) => void;
  setAlgorithmParams: (params: Partial<AlgorithmParams>) => void;
  setTileLayerUrl: (url: string) => void;
  setAircraftFilter: (filter: 'all' | 'suspicious' | 'air' | 'ground' | null) => void;
  
  // Assignment Actions
  assignAircraft: (aircraftId: string, positionId: string) => boolean;
  unassignAircraft: (aircraftId: string) => void;
  
  // Algorithm Actions
  runAutoDistribute: () => void;
  clearAllAssignments: () => void;
  
  // Data Management
  updateAircraft: (aircraft: Aircraft[]) => void;
  updatePositions: (positions: Position[]) => void;
  updateAircraftLocation: (aircraftId: string, lat: number, lon: number, location: 'ground' | 'air') => void;
  markAircraftAsSuspicious: (aircraftId: string, reason: string) => void;
  
  // Computed
  getPositionOccupancy: (positionId: string) => number;
  getAvailableCapacity: (positionId: string) => number;
  getAssignedAircraft: (positionId: string) => Aircraft[];
  getUnassignedAircraft: () => Aircraft[];
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Initial Data
  bases: sampleBases,
  positions: samplePositions,
  aircraft: sampleAircraft,
  squadrons: sampleSquadrons,
  shelters: sampleShelters,
  domes: sampleDomes,
  
  // User
  currentUser: { id: 'guest', username: 'guest', role: 'viewer' },
  
  // UI State
  selectedPositionId: null,
  selectedAircraftId: null,
  placementMode: 'manual',
  selectedAlgorithm: 'spread-evenly',
  algorithmParams: {
    randomnessFactor: 0,
    maxPerPosition: 0, // 0 means use position capacity
    distanceWeight: 1.0
  },
  tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  aircraftFilter: null,
  
  // Actions
  setCurrentUser: (user) => set({ currentUser: user }),
  selectPosition: (id) => set({ selectedPositionId: id }),
  selectAircraft: (id) => set({ selectedAircraftId: id }),
  setPlacementMode: (mode) => set({ placementMode: mode }),
  setSelectedAlgorithm: (algorithm) => set({ selectedAlgorithm: algorithm }),
  setAlgorithmParams: (params) => set((state) => ({
    algorithmParams: { ...state.algorithmParams, ...params }
  })),
  setTileLayerUrl: (url) => set({ tileLayerUrl: url }),
  setAircraftFilter: (filter) => set({ aircraftFilter: filter }),
  
  // Assignment
  assignAircraft: (aircraftId, positionId) => {
    const state = get();
    const position = state.positions.find(p => p.id === positionId);
    if (!position) return false;
    
    const currentOccupancy = state.getPositionOccupancy(positionId);
    if (currentOccupancy >= position.capacity) return false;
    
    set({
      aircraft: state.aircraft.map(a =>
        a.id === aircraftId
          ? { ...a, assignedPositionId: positionId, status: 'assigned' as const }
          : a
      )
    });
    return true;
  },
  
  unassignAircraft: (aircraftId) => {
    set((state) => ({
      aircraft: state.aircraft.map(a =>
        a.id === aircraftId
          ? { ...a, assignedPositionId: null, status: 'unassigned' as const }
          : a
      )
    }));
  },
  
  // Algorithms
  runAutoDistribute: () => {
    const state = get();
    const algorithm = state.selectedAlgorithm;
    const params = state.algorithmParams;
    
    // Get unassigned aircraft (excluding maintenance)
    const unassignedAircraft = state.aircraft.filter(
      a => a.status === 'unassigned' && a.assignedPositionId === null
    );
    
    // Create a mutable copy of positions with current occupancy
    const positionOccupancy = new Map<string, number>();
    state.positions.forEach(p => {
      positionOccupancy.set(p.id, state.getPositionOccupancy(p.id));
    });
    
    const newAssignments = new Map<string, string>(); // aircraftId -> positionId
    
    if (algorithm === 'spread-evenly') {
      // Sort positions by current occupancy (ascending)
      const sortedPositions = [...state.positions].sort((a, b) => {
        const occA = positionOccupancy.get(a.id) || 0;
        const occB = positionOccupancy.get(b.id) || 0;
        return occA - occB;
      });
      
      for (const aircraft of unassignedAircraft) {
        // Find position with lowest occupancy that has capacity
        for (const position of sortedPositions) {
          const currentOcc = positionOccupancy.get(position.id) || 0;
          const maxCap = params.maxPerPosition > 0 
            ? Math.min(params.maxPerPosition, position.capacity) 
            : position.capacity;
          
          if (currentOcc < maxCap) {
            newAssignments.set(aircraft.id, position.id);
            positionOccupancy.set(position.id, currentOcc + 1);
            // Re-sort after assignment
            sortedPositions.sort((a, b) => {
              const occA = positionOccupancy.get(a.id) || 0;
              const occB = positionOccupancy.get(b.id) || 0;
              return occA - occB;
            });
            break;
          }
        }
      }
    } else if (algorithm === 'cluster') {
      // Sort positions by current occupancy (descending) - fill up positions first
      const sortedPositions = [...state.positions].sort((a, b) => {
        const occA = positionOccupancy.get(a.id) || 0;
        const occB = positionOccupancy.get(b.id) || 0;
        return occB - occA;
      });
      
      for (const aircraft of unassignedAircraft) {
        // Find position with highest occupancy that still has capacity
        for (const position of sortedPositions) {
          const currentOcc = positionOccupancy.get(position.id) || 0;
          const maxCap = params.maxPerPosition > 0 
            ? Math.min(params.maxPerPosition, position.capacity) 
            : position.capacity;
          
          if (currentOcc < maxCap) {
            newAssignments.set(aircraft.id, position.id);
            positionOccupancy.set(position.id, currentOcc + 1);
            // Re-sort after assignment
            sortedPositions.sort((a, b) => {
              const occA = positionOccupancy.get(a.id) || 0;
              const occB = positionOccupancy.get(b.id) || 0;
              return occB - occA;
            });
            break;
          }
        }
      }
    } else if (algorithm === 'minimize-distance') {
      // Calculate distance from aircraft home position (if available) to each position
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
      };
      
      // Default home position if not specified (center of all bases)
      const defaultLat = state.bases.reduce((sum, b) => sum + b.latitude, 0) / state.bases.length;
      const defaultLon = state.bases.reduce((sum, b) => sum + b.longitude, 0) / state.bases.length;
      
      // Greedy assignment by distance
      const remainingAircraft = [...unassignedAircraft];
      
      while (remainingAircraft.length > 0) {
        let bestAssignment: { aircraft: Aircraft; position: Position; distance: number } | null = null;
        
        for (const aircraft of remainingAircraft) {
          const homeLat = aircraft.homeLatitude ?? defaultLat;
          const homeLon = aircraft.homeLongitude ?? defaultLon;
          
          for (const position of state.positions) {
            const currentOcc = positionOccupancy.get(position.id) || 0;
            const maxCap = params.maxPerPosition > 0 
              ? Math.min(params.maxPerPosition, position.capacity) 
              : position.capacity;
            
            if (currentOcc >= maxCap) continue;
            
            const distance = calculateDistance(homeLat, homeLon, position.latitude, position.longitude);
            
            if (!bestAssignment || distance < bestAssignment.distance) {
              bestAssignment = { aircraft, position, distance };
            }
          }
        }
        
        if (bestAssignment) {
          newAssignments.set(bestAssignment.aircraft.id, bestAssignment.position.id);
          positionOccupancy.set(
            bestAssignment.position.id, 
            (positionOccupancy.get(bestAssignment.position.id) || 0) + 1
          );
          const idx = remainingAircraft.findIndex(a => a.id === bestAssignment!.aircraft.id);
          remainingAircraft.splice(idx, 1);
        } else {
          break; // No more valid assignments
        }
      }
    }
    
    // Apply assignments
    set((state) => ({
      aircraft: state.aircraft.map(a => {
        const newPositionId = newAssignments.get(a.id);
        if (newPositionId) {
          return { ...a, assignedPositionId: newPositionId, status: 'assigned' as const };
        }
        return a;
      })
    }));
  },
  
  clearAllAssignments: () => {
    set((state) => ({
      aircraft: state.aircraft.map(a => ({
        ...a,
        assignedPositionId: null,
        status: a.status === 'maintenance' ? 'maintenance' : 'unassigned'
      }))
    }));
  },
  
  // Data Management
  updateAircraft: (aircraft) => set({ aircraft }),
  updatePositions: (positions) => set({ positions }),
  updateAircraftLocation: (aircraftId, lat, lon, location) => {
    set((state) => ({
      aircraft: state.aircraft.map(a =>
        a.id === aircraftId
          ? {
              ...a,
              location,
              locationUncertain: false,
              uncertainLatitude: undefined,
              uncertainLongitude: undefined,
              homeLatitude: lat,
              homeLongitude: lon,
              lastStatusUpdate: new Date(),
            }
          : a
      )
    }));
  },
  
  markAircraftAsSuspicious: (aircraftId, reason) => {
    set((state) => ({
      aircraft: state.aircraft.map(a =>
        a.id === aircraftId
          ? {
              ...a,
              locationUncertain: true,
              suspicionReason: reason,
              lastStatusUpdate: new Date(),
              lastStatusUpdatedBy: state.currentUser ? {
                name: state.currentUser.username,
                personalNumber: 'N/A',
                phone: 'N/A'
              } : undefined,
            }
          : a
      )
    }));
  },
  
  // Computed
  getPositionOccupancy: (positionId) => {
    return get().aircraft.filter(a => a.assignedPositionId === positionId).length;
  },
  
  getAvailableCapacity: (positionId) => {
    const state = get();
    const position = state.positions.find(p => p.id === positionId);
    if (!position) return 0;
    return position.capacity - state.getPositionOccupancy(positionId);
  },
  
  getAssignedAircraft: (positionId) => {
    return get().aircraft.filter(a => a.assignedPositionId === positionId);
  },
  
  getUnassignedAircraft: () => {
    return get().aircraft.filter(a => a.assignedPositionId === null && a.status !== 'maintenance');
  }
}));
