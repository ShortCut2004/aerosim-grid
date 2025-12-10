import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSimulationStore } from '@/hooks/useSimulationStore';
import { Position, Aircraft } from '@/types/simulation';
import { cn } from '@/lib/utils';

// Custom marker icons
const createPositionIcon = (occupancy: number, capacity: number, isSelected: boolean) => {
  const percentage = capacity > 0 ? (occupancy / capacity) * 100 : 0;
  let color = '#22c55e'; // Green - empty
  if (percentage > 75) color = '#ef4444'; // Red - nearly full
  else if (percentage > 50) color = '#f59e0b'; // Amber - half full
  else if (percentage > 0) color = '#3b82f6'; // Blue - has some

  const borderColor = isSelected ? '#f59e0b' : '#1e293b';
  const size = isSelected ? 28 : 24;
  
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid ${borderColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: white;
        box-shadow: 0 0 10px ${color}80;
        transition: all 0.2s ease;
      ">${occupancy}/${capacity}</div>
    `,
    className: 'custom-position-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const createBaseIcon = (name: string) => {
  return L.divIcon({
    html: `
      <div style="
        padding: 4px 8px;
        background: rgba(15, 23, 42, 0.9);
        border: 2px solid #f59e0b;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        color: #f59e0b;
        white-space: nowrap;
        box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
      ">${name}</div>
    `,
    className: 'custom-base-marker',
    iconSize: [100, 24],
    iconAnchor: [50, 12],
  });
};

interface PositionMarkerProps {
  position: Position;
  isSelected: boolean;
  onClick: () => void;
}

const PositionMarker = ({ position, isSelected, onClick }: PositionMarkerProps) => {
  const { getPositionOccupancy, currentUser } = useSimulationStore();
  const occupancy = getPositionOccupancy(position.id);
  
  return (
    <Marker
      position={[position.latitude, position.longitude]}
      icon={createPositionIcon(occupancy, position.capacity, isSelected)}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup>
        <div className="font-mono text-xs">
          <div className="font-bold text-primary">{position.name}</div>
          <div>Type: {position.type}</div>
          <div>Capacity: {occupancy}/{position.capacity}</div>
        </div>
      </Popup>
    </Marker>
  );
};

const MapController = () => {
  const { bases } = useSimulationStore();
  const map = useMap();
  
  useEffect(() => {
    if (bases.length > 0) {
      const center = bases.reduce(
        (acc, base) => ({
          lat: acc.lat + base.latitude / bases.length,
          lon: acc.lon + base.longitude / bases.length,
        }),
        { lat: 0, lon: 0 }
      );
      map.setView([center.lat, center.lon], 13);
    }
  }, [bases, map]);
  
  return null;
};

interface DropZoneProps {
  onDrop: (positionId: string) => void;
}

const DropZone = ({ onDrop }: DropZoneProps) => {
  const map = useMapEvents({
    click: (e) => {
      // Handle click events if needed
    },
  });
  
  return null;
};

export const TacticalMap = () => {
  const {
    bases,
    positions,
    tileLayerUrl,
    selectedPositionId,
    selectPosition,
    getPositionOccupancy,
  } = useSimulationStore();

  return (
    <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
      <MapContainer
        center={[35.5, 45.75]}
        zoom={12}
        className="w-full h-full"
        style={{ height: '100%', minHeight: '500px' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={tileLayerUrl}
        />
        
        <MapController />
        
        {/* Base markers */}
        {bases.map((base) => (
          <Marker
            key={base.id}
            position={[base.latitude, base.longitude]}
            icon={createBaseIcon(base.name)}
          />
        ))}
        
        {/* Position markers */}
        {positions.map((position) => (
          <PositionMarker
            key={position.id}
            position={position}
            isSelected={selectedPositionId === position.id}
            onClick={() => selectPosition(position.id)}
          />
        ))}
      </MapContainer>
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/20 to-transparent" />
    </div>
  );
};
