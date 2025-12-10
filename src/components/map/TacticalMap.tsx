import { useEffect, useRef, useState } from 'react';
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

const createDomeIcon = (hasAircraft: boolean, aircraftCallsign?: string) => {
  const width = 50;
  const height = 50;
  const bgColor = hasAircraft ? '#22c55e' : '#6b7280'; // ירוק אם יש מטוס, אפור אם אין
  const borderColor = hasAircraft ? '#16a34a' : '#4b5563';
  
  const html = `
    <div style="
      position: relative;
      width: ${width}px;
      height: ${height}px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: ${bgColor};
      border: 3px solid ${borderColor};
      border-radius: 50%;
      box-shadow: 0 4px 12px ${bgColor}60;
      color: white;
      font-size: 10px;
      font-weight: 700;
      text-align: center;
      padding: 4px;
    ">
      <div style="font-size: 16px; margin-bottom: 2px;">${hasAircraft ? '✓' : '○'}</div>
      ${hasAircraft && aircraftCallsign ? `<div style="font-size: 8px; line-height: 1;">${aircraftCallsign}</div>` : ''}
      <div style="font-size: 7px; margin-top: 2px; opacity: 0.9;">${hasAircraft ? 'יש' : 'אין'}</div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'dome-marker',
    iconSize: [width, height],
    iconAnchor: [width / 2, height / 2],
  });
};

// Global map reference for zooming from other components
let globalMapRef: L.Map | null = null;

export const zoomToBase = (baseId: string, bases: Array<{ id: string; latitude: number; longitude: number }>) => {
  if (!globalMapRef) return;
  const base = bases.find(b => b.id === baseId);
  if (base) {
    globalMapRef.setView([base.latitude, base.longitude], 15);
  }
};

export const TacticalMap = () => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const planeMarkersRef = useRef<L.Marker[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(9);
  
  const {
    bases,
    positions,
    squadrons,
    shelters,
    domes,
    aircraft,
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
    globalMapRef = map;
    setZoomLevel(9);

    // Track zoom level
    const updateZoom = () => {
      setZoomLevel(map.getZoom());
    };
    map.on('zoomend', updateZoom);
    map.on('zoom', updateZoom);

    // Add tile layer
    L.tileLayer(tileLayerUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        globalMapRef = null;
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

    // Remove existing base markers and plane markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Remove old plane markers from ref
    planeMarkersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker);
    });
    planeMarkersRef.current = [];

    // Add base markers (clickable to zoom)
    bases.forEach((base) => {
      const baseMarker = L.marker([base.latitude, base.longitude], {
        icon: createBaseIcon(base.name),
      }).addTo(mapRef.current!);

      // Make base clickable to zoom in
      baseMarker.on('click', () => {
        if (mapRef.current) {
          mapRef.current.setView([base.latitude, base.longitude], 15);
        }
      });
    });

    // Show domes when zoomed in close (zoom level >= 15)
    if (zoomLevel >= 15 && mapRef.current) {
      domes.forEach((dome) => {
        const hasAircraft = dome.aircraftId !== null;
        const aircraftData = hasAircraft ? aircraft.find(a => a.id === dome.aircraftId) : null;
        
        const domeMarker = L.marker([dome.latitude, dome.longitude], {
          icon: createDomeIcon(hasAircraft, aircraftData?.callsign),
        }).addTo(mapRef.current!);

        // Create popup with dome info
        const shelter = shelters.find(s => s.id === dome.shelterId);
        const squadron = shelter ? squadrons.find(sq => sq.id === shelter.squadronId) : null;
        const base = squadron ? bases.find(b => b.id === squadron.baseId) : null;

        domeMarker.bindPopup(`
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; min-width: 150px;">
            <div style="font-weight: bold; margin-bottom: 4px; color: #f59e0b;">${dome.name}</div>
            ${shelter ? `<div style="font-size: 11px; margin-bottom: 2px;">דתק: ${shelter.name}</div>` : ''}
            ${squadron ? `<div style="font-size: 11px; margin-bottom: 2px;">טייסת: ${squadron.name}</div>` : ''}
            ${base ? `<div style="font-size: 11px; margin-bottom: 4px;">בסיס: ${base.name}</div>` : ''}
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
              <div style="font-weight: bold; margin-bottom: 2px;">סטטוס:</div>
              ${hasAircraft && aircraftData ? `
                <div style="font-size: 10px; color: #22c55e;">✓ יש מטוס</div>
                <div style="font-size: 10px; margin-top: 2px;">סימן קריאה: ${aircraftData.callsign}</div>
                <div style="font-size: 10px;">סוג: ${aircraftData.type}</div>
              ` : `
                <div style="font-size: 10px; color: #6b7280;">○ אין מטוס</div>
              `}
            </div>
          </div>
        `);
      });
    }

    // Center map on bases (only on initial load)
    if (bases.length > 0 && !mapRef.current.getBounds().isValid()) {
      const center = bases.reduce(
        (acc, base) => ({
          lat: acc.lat + base.latitude / bases.length,
          lon: acc.lon + base.longitude / bases.length,
        }),
        { lat: 0, lon: 0 }
      );
      mapRef.current.setView([center.lat, center.lon], 9);
    }
  }, [bases, squadrons, shelters, domes, aircraft, zoomLevel]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: '500px' }} />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/20 to-transparent" />
    </div>
  );
};
