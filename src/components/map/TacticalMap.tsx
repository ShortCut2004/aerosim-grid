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
  let color = '#16a34a';
  if (percentage > 75) color = '#ef4444';
  else if (percentage > 50) color = '#f59e0b';
  else if (percentage > 0) color = '#22c55e';

  const borderColor = isSelected ? '#f97316' : '#0b1224';

  const width = 70;
  const height = 46;

  const html = `
    <div style="
      position: relative;
      width: ${width}px;
      height: ${height}px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(180deg, ${color} 0%, ${color}dd 100%);
      color: white;
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 0.2px;
      border: 3px solid ${borderColor};
      border-radius: 12px;
      box-shadow: 0 10px 20px ${color}40, 0 0 0 1px #0b122420;
    ">
      ${occupancy}/${capacity}
      <div style="
        position: absolute;
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
        border-top: 12px solid ${borderColor};
        filter: drop-shadow(0 4px 6px ${borderColor}70);
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-position-marker',
    iconSize: [width, height + 12],
    iconAnchor: [width / 2, height + 12],
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

const createPlaneIcon = () => {
  const html = `
    <div style="
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0ea5e9;
      color: white;
      border-radius: 50%;
      box-shadow: 0 4px 10px #0ea5e980;
      font-size: 12px;
      font-weight: 700;
    ">✈️</div>
  `;

  return L.divIcon({
    html,
    className: 'plane-icon-marker',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
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

    // Add simple plane markers near each base (fixed offsets to keep stable)
    const offsets: Array<[number, number]> = [
      [0.01, 0.01],
      [-0.012, 0.006],
      [0.008, -0.009],
    ];

    bases.forEach((base) => {
      offsets.forEach((offset) => {
        const [latOffset, lonOffset] = offset;
        L.marker([base.latitude + latOffset, base.longitude + lonOffset], {
          icon: createPlaneIcon(),
        }).addTo(mapRef.current!);
      });
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
