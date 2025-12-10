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

  const borderColor = isSelected ? '#f59e0b' : '#0f172a';

  const width = 62;
  const height = 42;

  const html = `
    <div style="
      position: relative;
      width: ${width}px;
      height: ${height}px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${color};
      color: white;
      font-weight: 700;
      font-size: 12px;
      border: 3px solid ${borderColor};
      border-radius: 10px;
      box-shadow: 0 6px 14px ${color}50;
    ">
      ${occupancy}/${capacity}
      <div style="
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 10px solid ${color};
        filter: drop-shadow(0 2px 4px ${color}60);
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-position-marker',
    iconSize: [width, height + 10],
    iconAnchor: [width / 2, height + 10],
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

const createPlacementHintIcon = () => {
  const width = 22;
  const height = 22;
  const color = '#9ca3af'; // gray

  const html = `
    <div style="
      position: relative;
      width: ${width}px;
      height: ${height}px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${color};
      border-radius: 10px;
      box-shadow: 0 4px 10px ${color}60;
    ">
      <div style="
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid ${color};
        filter: drop-shadow(0 2px 4px ${color}60);
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'placement-hint-marker',
    iconSize: [width, height + 8],
    iconAnchor: [width / 2, height + 8],
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
    const defaultCenter: L.LatLngExpression = [31.0461, 34.8516];
    const map = L.map(containerRef.current).setView(defaultCenter, 9);
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

    // Add placement hint markers (gray arrows) that list available bases
    const availableBases = bases.map((b) => b.name).join(', ');
    positions.forEach((position) => {
      const hintMarker = L.marker([position.latitude, position.longitude], {
        icon: createPlacementHintIcon(),
      }).addTo(mapRef.current!);

      hintMarker.bindPopup(`
        <div style="font-family: monospace; font-size: 12px;">
          <div style="font-weight: bold; margin-bottom: 4px;">Placement Options</div>
          <div>Available bases: ${availableBases}</div>
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
