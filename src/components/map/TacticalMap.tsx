import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSimulationStore } from '@/hooks/useSimulationStore';

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createPositionIcon = (occupancy: number, capacity: number, isSelected: boolean) => {
  const percentage = capacity > 0 ? (occupancy / capacity) * 100 : 0;
  let color = '#22c55e';
  if (percentage > 75) color = '#ef4444';
  else if (percentage > 50) color = '#f59e0b';
  else if (percentage > 0) color = '#3b82f6';

  const borderColor = isSelected ? '#f59e0b' : '#1e293b';
  const size = isSelected ? 28 : 24;
  
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:3px solid ${borderColor};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;color:white;box-shadow:0 0 10px ${color}80;">${occupancy}/${capacity}</div>`,
    className: 'custom-position-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const createBaseIcon = (name: string) => {
  return L.divIcon({
    html: `<div style="padding:4px 8px;background:rgba(15,23,42,0.9);border:2px solid #f59e0b;border-radius:4px;font-size:11px;font-weight:600;color:#f59e0b;white-space:nowrap;box-shadow:0 0 15px rgba(245,158,11,0.3);">${name}</div>`,
    className: 'custom-base-marker',
    iconSize: [100, 24],
    iconAnchor: [50, 12],
  });
};

export const TacticalMap = () => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    bases,
    positions,
    tileLayerUrl,
    selectedPositionId,
    selectPosition,
    getPositionOccupancy,
  } = useSimulationStore();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current).setView([35.5, 45.75], 12);
    mapRef.current = map;

    // Add tile layer
    L.tileLayer(tileLayerUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update tile layer when URL changes
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Remove existing tile layers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add new tile layer
    L.tileLayer(tileLayerUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);
  }, [tileLayerUrl]);

  // Update markers when data changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add base markers
    bases.forEach((base) => {
      L.marker([base.latitude, base.longitude], {
        icon: createBaseIcon(base.name),
      }).addTo(mapRef.current!);
    });

    // Add position markers
    positions.forEach((position) => {
      const occupancy = getPositionOccupancy(position.id);
      const isSelected = selectedPositionId === position.id;
      
      const marker = L.marker([position.latitude, position.longitude], {
        icon: createPositionIcon(occupancy, position.capacity, isSelected),
      }).addTo(mapRef.current!);

      marker.on('click', () => {
        selectPosition(position.id);
      });

      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 12px;">
          <div style="font-weight: bold;">${position.name}</div>
          <div>Type: ${position.type}</div>
          <div>Capacity: ${occupancy}/${position.capacity}</div>
        </div>
      `);
    });

    // Center map on bases
    if (bases.length > 0) {
      const center = bases.reduce(
        (acc, base) => ({
          lat: acc.lat + base.latitude / bases.length,
          lon: acc.lon + base.longitude / bases.length,
        }),
        { lat: 0, lon: 0 }
      );
      mapRef.current.setView([center.lat, center.lon], 13);
    }
  }, [bases, positions, selectedPositionId, getPositionOccupancy, selectPosition]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: '500px' }} />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/20 to-transparent" />
    </div>
  );
};
