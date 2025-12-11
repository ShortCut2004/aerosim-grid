import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSimulationStore } from '@/hooks/useSimulationStore';
import type { Aircraft } from '@/types/simulation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Import logos
import palmachimLogo from '@/assets/logos/פלמחים.png';
import telNofLogo from '@/assets/logos/IAF_Bacha_8_Tel_Nof_AFB_Emblem.png';
import ramatDavidLogo from '@/assets/logos/Kanaf_1_ramat-david.png';
import ramonLogo from '@/assets/logos/רמון.png';
import hatzorLogo from '@/assets/logos/חצור.png';
import airForceLogo from '@/assets/logos/IAF_New_Logo_2018.png';

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

// פונקציה ליצירת לוגו בסיס - משתמש בתמונות
const getBaseLogoUrl = (name: string): string => {
  const logoMap: Record<string, string> = {
    'פלמחים': palmachimLogo,
    'תל נוף': telNofLogo,
    'רמת דוד': ramatDavidLogo,
    'מצפה רמון': ramonLogo,
    'חצור': hatzorLogo,
    'גן יבנה': hatzorLogo, // גן יבנה זה חצור
  };
  
  return logoMap[name] || '';
};

const createBaseIcon = (name: string) => {
  const logoUrl = getBaseLogoUrl(name);
  
  // אם יש תמונה, משתמש בה
  if (logoUrl) {
    return L.divIcon({
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 8px;
          padding: 4px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          min-width: 50px;
        ">
          <img src="${logoUrl}" alt="${name}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 50px;" />
          <div style="
            font-weight: bold;
            font-size: 9px;
            color: #000000;
            white-space: nowrap;
            margin-top: 2px;
          ">${name}</div>
        </div>
      `,
      className: 'custom-base-marker',
      iconSize: [60, 50],
      iconAnchor: [30, 25],
    });
  }
  
  // אחרת, לוגו ברירת מחדל
  return L.divIcon({
    html: `<div style="padding:4px 8px;background:rgba(15,23,42,0.9);border:2px solid #f59e0b;border-radius:4px;font-size:11px;font-weight:600;color:#f59e0b;white-space:nowrap;box-shadow:0 0 15px rgba(245,158,11,0.3);">${name}</div>`,
    className: 'custom-base-marker',
    iconSize: [100, 24],
    iconAnchor: [50, 12],
  });
};

const createPlaneIcon = (isSuspicious: boolean = false, isDraggable: boolean = false) => {
  const bgColor = isSuspicious ? '#ef4444' : '#0ea5e9';
  const borderColor = isSuspicious ? '#dc2626' : '#0284c7';
  const cursor = isDraggable ? 'grab' : 'pointer';
  
  const html = `
    <div style="
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${bgColor};
      border: 2px solid ${borderColor};
      color: white;
      border-radius: 50%;
      box-shadow: 0 4px 10px ${bgColor}80;
      font-size: 12px;
      font-weight: 700;
      cursor: ${cursor};
    ">✈️</div>
  `;

  return L.divIcon({
    html,
    className: 'plane-icon-marker',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

const createShelterIcon = (name: string) => {
  return L.divIcon({
    html: `<div style="padding:3px 6px;background:rgba(59,130,246,0.9);border:2px solid #3b82f6;border-radius:4px;font-size:10px;font-weight:600;color:white;white-space:nowrap;box-shadow:0 0 10px rgba(59,130,246,0.4);">${name}</div>`,
    className: 'custom-shelter-marker',
    iconSize: [80, 20],
    iconAnchor: [40, 10],
  });
};

const createDomeIcon = (hasAircraft: boolean, isSuspicious: boolean = false, aircraftCallsign?: string) => {
  const width = 40;
  const height = 40;
  // אדום אם מטוס חשוד, ירוק אם יש מטוס רגיל, אפור אם אין מטוס
  const bgColor = isSuspicious ? '#ef4444' : hasAircraft ? '#22c55e' : '#6b7280';
  const borderColor = isSuspicious ? '#dc2626' : hasAircraft ? '#16a34a' : '#4b5563';
  
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
      border: 2px solid ${borderColor};
      border-radius: 50%;
      box-shadow: 0 3px 8px ${bgColor}60;
      color: white;
      font-size: 9px;
      font-weight: 700;
      text-align: center;
      padding: 3px;
    ">
      <div style="font-size: 14px; margin-bottom: 1px;">${hasAircraft ? '✓' : '○'}</div>
      ${hasAircraft && aircraftCallsign ? `<div style="font-size: 7px; line-height: 1;">${aircraftCallsign}</div>` : ''}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'dome-marker',
    iconSize: [width, height],
    iconAnchor: [width / 2, height / 2],
  });
};

// Calculate dome positions around a shelter in a grid pattern
const calculateDomePositions = (
  shelterLat: number,
  shelterLon: number,
  domeCount: number,
  index: number
): [number, number] => {
  // הגדלת המרחק בין כיפות - בערך 0.0008 מעלות ≈ 80 מטר (לעומת 0.0003 בעבר)
  // זה יגדיל את שטח הסכם (הריבוע) של כל דתק
  const offset = 0.0008;
  
  // Calculate grid dimensions
  const cols = domeCount <= 3 ? 2 : 2;
  const rows = Math.ceil(domeCount / cols);
  
  // Calculate position in grid
  const col = index % cols;
  const row = Math.floor(index / cols);
  
  // Center the grid around the shelter
  const startLat = shelterLat - (rows - 1) * offset / 2;
  const startLon = shelterLon - (cols - 1) * offset / 2;
  
  const lat = startLat + row * offset;
  const lon = startLon + col * offset;
  
  return [lat, lon];
};

// Global map reference for zooming from other components
let globalMapRef: L.Map | null = null;

export const zoomToBase = (baseId: string, bases: Array<{ id: string; latitude: number; longitude: number }>, shelters?: Array<{ id: string; squadronId: string; latitude: number; longitude: number }>, squadrons?: Array<{ id: string; baseId: string }>) => {
  if (!globalMapRef) return;
  const base = bases.find(b => b.id === baseId);
  if (base) {
    // אם יש shelters ו-squadrons, נחשב את ה-bounds של כל הדתקים
    if (shelters && squadrons) {
      const baseSquadrons = squadrons.filter(sq => sq.baseId === baseId);
      const baseShelters = shelters.filter(sh => baseSquadrons.some(sq => sq.id === sh.squadronId));
      
      if (baseShelters.length > 0) {
        // חישוב bounds לכל הדתקים
        const lats = baseShelters.map(sh => sh.latitude);
        const lons = baseShelters.map(sh => sh.longitude);
        const bounds = L.latLngBounds(
          [Math.min(...lats), Math.min(...lons)],
          [Math.max(...lats), Math.max(...lons)]
        );
        // fitBounds עם padding כדי שכל הדתקים יהיו נראים
        globalMapRef.fitBounds(bounds, { padding: [150, 150] });
      } else {
        globalMapRef.setView([base.latitude, base.longitude], 15);
      }
    } else {
      globalMapRef.setView([base.latitude, base.longitude], 15);
    }
  }
};

export const TacticalMap = () => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const planeMarkersRef = useRef<L.Marker[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(9);
  const [suspicionModalOpen, setSuspicionModalOpen] = useState(false);
  const [selectedAircraftForSuspicion, setSelectedAircraftForSuspicion] = useState<{ id: string; callsign: string } | null>(null);
  const [suspicionReason, setSuspicionReason] = useState('');
  
  // Store state setters in refs so they can be accessed in event handlers
  const setSuspicionModalOpenRef = useRef(setSuspicionModalOpen);
  const setSelectedAircraftForSuspicionRef = useRef(setSelectedAircraftForSuspicion);
  
  useEffect(() => {
    setSuspicionModalOpenRef.current = setSuspicionModalOpen;
    setSelectedAircraftForSuspicionRef.current = setSelectedAircraftForSuspicion;
  }, []);
  
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
    aircraftFilter,
    updateAircraftLocation,
    markAircraftAsSuspicious,
  } = useSimulationStore();
  
  // Listen for custom event to open suspicion modal
  useEffect(() => {
    const handleOpenSuspicionModal = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string; callsign: string }>;
      if (customEvent.detail) {
        console.log('Opening suspicion modal for:', customEvent.detail); // Debug log
        setSelectedAircraftForSuspicion({
          id: customEvent.detail.id,
          callsign: customEvent.detail.callsign
        });
        setSuspicionModalOpen(true);
      }
    };
    
    window.addEventListener('openSuspicionModal', handleOpenSuspicionModal);
    return () => {
      window.removeEventListener('openSuspicionModal', handleOpenSuspicionModal);
    };
  }, []);

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

    // Handle drop events for drag-and-drop from sidebar
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'move';
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const aircraftId = e.dataTransfer?.getData('aircraftId');
      if (!aircraftId || !mapRef.current) return;

      // Get mouse position and convert to lat/lng
      const mapContainer = mapRef.current.getContainer();
      const rect = mapContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const point = mapRef.current.containerPointToLatLng([x, y]);
      
      // Determine location based on current filter
      const { aircraftFilter, aircraft, updateAircraftLocation } = useSimulationStore.getState();
      const plane = aircraft.find(a => a.id === aircraftId);
      if (!plane) return;

      const newLocation = aircraftFilter === 'air' ? 'air' : aircraftFilter === 'ground' ? 'ground' : plane.location;
      updateAircraftLocation(aircraftId, point.lat, point.lng, newLocation);
    };

    const mapContainer = map.getContainer();
    mapContainer.addEventListener('dragover', handleDragOver);
    mapContainer.addEventListener('drop', handleDrop);

    // Cleanup
    return () => {
      if (mapRef.current) {
        const container = mapRef.current.getContainer();
        container.removeEventListener('dragover', handleDragOver);
        container.removeEventListener('drop', handleDrop);
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

    // Remove existing base markers, plane markers, and polygons (shelter boundaries)
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Rectangle || layer instanceof L.Polygon) {
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

    // Show shelters and domes when zoomed in close (zoom level >= 14)
    if (zoomLevel >= 14 && mapRef.current) {
      // Helper function to format dates
      const formatDate = (date?: Date) => {
        if (!date) return 'לא עודכן';
        return new Intl.DateTimeFormat('he-IL', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date);
      };
      
      // Group domes by shelter
      const domesByShelter = new Map<string, typeof domes>();
      domes.forEach((dome) => {
        if (!domesByShelter.has(dome.shelterId)) {
          domesByShelter.set(dome.shelterId, []);
        }
        domesByShelter.get(dome.shelterId)!.push(dome);
      });

      // Add shelter boundaries and their domes
      shelters.forEach((shelter) => {
        const shelterDomes = domesByShelter.get(shelter.id) || [];
        
        if (shelterDomes.length === 0) return;
        
        // Get squadron and base info for popup
        const squadron = squadrons.find(sq => sq.id === shelter.squadronId);
        const base = squadron ? bases.find(b => b.id === squadron.baseId) : null;
        
        // Calculate positions for all domes
        const domePositions: [number, number][] = [];
        shelterDomes.forEach((dome, index) => {
          const [domeLat, domeLon] = calculateDomePositions(
            shelter.latitude,
            shelter.longitude,
            shelterDomes.length,
            index
          );
          domePositions.push([domeLat, domeLon]);
        });
        
        // Calculate bounding box for the domes (with padding)
        // הגדלת ה-padding כדי להתאים למרחק הגדול יותר בין הכיפות
        const padding = 0.0004; // padding around domes (הוגדל מ-0.00025)
        const lats = domePositions.map(p => p[0]);
        const lons = domePositions.map(p => p[1]);
        const minLat = Math.min(...lats) - padding;
        const maxLat = Math.max(...lats) + padding;
        const minLon = Math.min(...lons) - padding;
        const maxLon = Math.max(...lons) + padding;
        
        // Calculate center for label
        const centerLat = (minLat + maxLat) / 2;
        const centerLon = (minLon + maxLon) / 2;
        
        // Create rectangle polygon around all domes (this is the shelter boundary) - מלבן שחור
        const shelterBoundary = L.rectangle(
          [[minLat, minLon], [maxLat, maxLon]],
          {
            color: '#000000',
            weight: 3,
            fillColor: 'rgba(0, 0, 0, 0.1)',
            fillOpacity: 0.15,
            dashArray: '8, 4',
            className: 'shelter-boundary',
          }
        ).addTo(mapRef.current!);
        
        // Add label with shelter name above the boundary (centered at top)
        const labelIcon = L.divIcon({
          html: `
            <div style="
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: white;
              padding: 5px 12px;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 700;
              white-space: nowrap;
              border: 2px solid #1e40af;
              box-shadow: 0 3px 10px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
              text-align: center;
              letter-spacing: 0.3px;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            ">
              ${shelter.name}
            </div>
          `,
          className: 'shelter-label',
          iconSize: [120, 35],
          iconAnchor: [60, 35],
        });
        
        // Create popup content for shelter
        const popupContent = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; min-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 4px; color: #3b82f6;">${shelter.name}</div>
            ${squadron ? `<div style="font-size: 11px; margin-bottom: 2px;">טייסת: ${squadron.name}</div>` : ''}
            ${base ? `<div style="font-size: 11px; margin-bottom: 4px;">בסיס: ${base.name}</div>` : ''}
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
              <div style="font-size: 10px; margin-bottom: 4px;">מספר כיפות: ${shelterDomes.length}</div>
              ${shelter.lastUpdated ? `
                <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
                  <div style="font-weight: bold; font-size: 10px; margin-bottom: 2px;">עדכון אחרון:</div>
                  <div style="font-size: 10px; margin-bottom: 2px;">תאריך ושעה: ${formatDate(shelter.lastUpdated)}</div>
                  ${shelter.updatedBy ? `
                    <div style="font-size: 10px; margin-top: 4px;">
                      <div style="font-weight: bold; margin-bottom: 2px;">מי עדכן:</div>
                      <div style="font-size: 9px;">שם: ${shelter.updatedBy.name}</div>
                      <div style="font-size: 9px;">מספר אישי: ${shelter.updatedBy.personalNumber}</div>
                      <div style="font-size: 9px;">טלפון: ${shelter.updatedBy.phone}</div>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          </div>
        `;
        
        // Bind popup to both boundary and label
        shelterBoundary.bindPopup(popupContent);
        
        const labelMarker = L.marker([maxLat + 0.00015, centerLon], {
          icon: labelIcon,
        }).addTo(mapRef.current!);
        
        // Make label clickable too (same popup as boundary)
        labelMarker.bindPopup(popupContent);

        // Add domes around the shelter in organized grid
        shelterDomes.forEach((dome, index) => {
          const hasAircraft = dome.aircraftId !== null;
          const aircraftData = hasAircraft ? aircraft.find(a => a.id === dome.aircraftId) : null;
          const isSuspicious = aircraftData?.locationUncertain === true;
          
          // Use calculated position
          const [domeLat, domeLon] = domePositions[index];
          
          const domeMarker = L.marker([domeLat, domeLon], {
            icon: createDomeIcon(hasAircraft, isSuspicious, aircraftData?.callsign),
          }).addTo(mapRef.current!);

          // Create popup with dome info
          const popupDiv = document.createElement('div');
          popupDiv.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
          popupDiv.style.fontSize = '12px';
          popupDiv.style.minWidth = '200px';
          popupDiv.style.direction = 'rtl';
          
          popupDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px; color: #f59e0b;">${dome.name}</div>
            <div style="font-size: 11px; margin-bottom: 2px;">דתק: ${shelter.name}</div>
            ${squadron ? `<div style="font-size: 11px; margin-bottom: 2px;">טייסת: ${squadron.name}</div>` : ''}
            ${base ? `<div style="font-size: 11px; margin-bottom: 4px;">בסיס: ${base.name}</div>` : ''}
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
              <div style="font-weight: bold; margin-bottom: 2px;">סטטוס:</div>
              ${hasAircraft && aircraftData ? `
                <div style="font-size: 10px; color: ${isSuspicious ? '#ef4444' : '#22c55e'};">
                  ${isSuspicious ? '⚠ מטוס חשוד' : '✓ יש מטוס'}
                </div>
                <div style="font-size: 10px; margin-top: 2px;">סימן קריאה: ${aircraftData.callsign}</div>
                <div style="font-size: 10px;">סוג: ${aircraftData.type}</div>
                ${isSuspicious && aircraftData.suspicionReason ? `
                  <div style="font-size: 10px; margin-top: 4px; color: #ef4444;">
                    <div style="font-weight: bold;">סיבה לחשד:</div>
                    <div>${aircraftData.suspicionReason}</div>
                  </div>
                ` : ''}
              ` : `
                <div style="font-size: 10px; color: #6b7280;">○ אין מטוס</div>
              `}
            </div>
            ${dome.lastUpdated ? `
              <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
                <div style="font-weight: bold; font-size: 10px; margin-bottom: 2px;">עדכון אחרון:</div>
                <div style="font-size: 10px; margin-bottom: 2px;">תאריך ושעה: ${formatDate(dome.lastUpdated)}</div>
                ${dome.updatedBy ? `
                  <div style="font-size: 10px; margin-top: 4px;">
                    <div style="font-weight: bold; margin-bottom: 2px;">מי עדכן:</div>
                    <div style="font-size: 9px;">שם: ${dome.updatedBy.name}</div>
                    <div style="font-size: 9px;">מספר אישי: ${dome.updatedBy.personalNumber}</div>
                    <div style="font-size: 9px;">טלפון: ${dome.updatedBy.phone}</div>
                  </div>
                ` : ''}
              </div>
            ` : ''}
            ${hasAircraft && aircraftData && !isSuspicious ? `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #333;">
                <button id="mark-suspicious-btn-${dome.aircraftId}" style="
                  width: 100%;
                  padding: 6px 12px;
                  background: #ef4444;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  font-size: 11px;
                  font-weight: 600;
                  cursor: pointer;
                  transition: background 0.2s;
                ">סימון מטוס כחשוד</button>
              </div>
            ` : ''}
          `;
          
          domeMarker.bindPopup(popupDiv);
          
          // Add click handler for mark suspicious button AFTER binding popup
          if (hasAircraft && aircraftData && !isSuspicious) {
            // Store aircraft data in closure
            const aircraftId = aircraftData.id;
            const aircraftCallsign = aircraftData.callsign;
            
            // Use popupopen event to attach handler when popup opens
            domeMarker.on('popupopen', () => {
              // Wait for DOM to be ready
              setTimeout(() => {
                // Try to find button in the popup content (Leaflet might clone the element)
                const popupContent = domeMarker.getPopup()?.getContent();
                const popupElement = typeof popupContent === 'string' 
                  ? document.querySelector('.leaflet-popup-content') 
                  : popupContent as HTMLElement;
                
                const button = popupElement?.querySelector(`#mark-suspicious-btn-${dome.aircraftId}`) as HTMLButtonElement;
                if (button) {
                  // Remove any existing handler
                  button.onclick = null;
                  
                  // Add new handler using window event to access React state
                  button.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Button clicked! Aircraft:', { id: aircraftId, callsign: aircraftCallsign });
                    // Dispatch custom event that React can listen to
                    const event = new CustomEvent('openSuspicionModal', {
                      detail: { id: aircraftId, callsign: aircraftCallsign },
                      bubbles: true,
                      cancelable: true
                    });
                    console.log('Dispatching event:', event);
                    const dispatched = window.dispatchEvent(event);
                    console.log('Event dispatched, result:', dispatched);
                    mapRef.current?.closePopup();
                  };
                }
              }, 100);
            });
          }
        });
      });
    }

    // Show aircraft markers only when zoomed in close (zoom level >= 15, like when clicking on base)
    // מטוסים יוצגו רק כשמגדילים את המפה (כמו שהיה קודם - zoom >= 15)
    // וגם יש פילטר פעיל (לא 'all')
    if (zoomLevel >= 15 && aircraftFilter && mapRef.current) {
      // Filter aircraft based on selected filter
      // אם אין מטוס בכיפה, הוא נחשב באוויר
      let filteredAircraft: typeof aircraft = [];
      if (aircraftFilter === 'all') {
        filteredAircraft = aircraft;
      } else if (aircraftFilter === 'suspicious') {
        filteredAircraft = aircraft.filter(a => a.locationUncertain === true);
      } else if (aircraftFilter === 'air') {
        // מטוסים באוויר: 
        // 1. location === 'air' ו-!locationUncertain (גם אם יש assignedDomeId)
        // 2. יש assignedDomeId אבל הכיפה ריקה (dome.aircraftId === null) - נחשב באוויר
        // 3. יש assignedDomeId אבל הכיפה מכילה מטוס אחר (dome.aircraftId !== a.id) - נחשב באוויר
        filteredAircraft = aircraft.filter(a => {
          if (a.locationUncertain) return false; // מטוסים חשודים לא נכללים כאן
          
          // אם המטוס לא מוקצה לכיפה, בודקים לפי location
          if (a.assignedDomeId === null) {
            return a.location === 'air';
          }
          
          // אם המטוס מוקצה לכיפה, בודקים את מצב הכיפה
          const dome = domes.find(d => d.id === a.assignedDomeId);
          if (!dome) {
            // אם הכיפה לא קיימת, בודקים לפי location
            return a.location === 'air';
          }
          
          // אם הכיפה ריקה, המטוס באוויר (גם אם location === 'ground')
          if (dome.aircraftId === null) return true;
          
          // אם הכיפה מכילה מטוס אחר, המטוס הזה לא על הקרקע
          if (dome.aircraftId !== a.id) return true;
          
          // אם הכיפה מכילה את המטוס הזה, בודקים לפי location
          return a.location === 'air';
        });
      } else if (aircraftFilter === 'ground') {
        // מטוסים על הקרקע: 
        // כל מטוס שהכיפה שלו מכילה אותו (dome.aircraftId === a.id)
        // זה מסתנכרן עם ListView שסופר כיפות תפוסות
        filteredAircraft = aircraft.filter(a => {
          if (a.locationUncertain) return false; // מטוסים חשודים לא נכללים כאן
          if (a.assignedDomeId === null) return false;
          
          // בודקים אם הכיפה באמת מכילה את המטוס
          const dome = domes.find(d => d.id === a.assignedDomeId);
          if (!dome) return false;
          
          // אם הכיפה מכילה את המטוס הזה, הוא על הקרקע (לא משנה מה ה-location שלו)
          return dome.aircraftId === a.id;
        });
      }
      filteredAircraft.forEach((plane) => {
        // Determine position - use uncertain coordinates if available, otherwise use home or dome location
        let lat: number;
        let lon: number;
        
        if (plane.locationUncertain && plane.uncertainLatitude && plane.uncertainLongitude) {
          lat = plane.uncertainLatitude;
          lon = plane.uncertainLongitude;
        } else if (plane.assignedDomeId) {
          const dome = domes.find(d => d.id === plane.assignedDomeId);
          if (dome) {
            const shelter = shelters.find(s => s.id === dome.shelterId);
            if (shelter) {
              // Calculate position relative to shelter
              const shelterDomes = domes.filter(d => d.shelterId === shelter.id);
              const domeIndex = shelterDomes.findIndex(d => d.id === plane.assignedDomeId);
              const [domeLat, domeLon] = calculateDomePositions(
                shelter.latitude,
                shelter.longitude,
                shelterDomes.length,
                domeIndex
              );
              lat = domeLat;
              lon = domeLon;
            } else {
              return; // Skip if shelter not found
            }
          } else {
            return; // Skip if dome not found
          }
        } else if (plane.homeLatitude && plane.homeLongitude) {
          lat = plane.homeLatitude;
          lon = plane.homeLongitude;
        } else {
          return; // Skip if no location available
        }

        const isSuspicious = plane.locationUncertain === true;
        const isDraggable = isSuspicious || aircraftFilter === 'air' || aircraftFilter === 'ground';
        
        const planeMarker = L.marker([lat, lon], {
          icon: createPlaneIcon(isSuspicious, isDraggable),
          draggable: isDraggable,
        }).addTo(mapRef.current!);

        // Handle drag end to update location
        if (isDraggable) {
          planeMarker.on('dragend', (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            const newLocation = aircraftFilter === 'air' ? 'air' : aircraftFilter === 'ground' ? 'ground' : plane.location;
            updateAircraftLocation(plane.id, position.lat, position.lng, newLocation);
          });
        }

        // Create popup
        const formatDate = (date?: Date) => {
          if (!date) return 'לא עודכן';
          return new Intl.DateTimeFormat('he-IL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }).format(date);
        };

        const getAircraftLocation = () => {
          if (plane.locationUncertain) return 'מיקום לא מעודכן';
          if (plane.assignedDomeId) {
            const dome = domes.find(d => d.id === plane.assignedDomeId);
            if (dome) {
              const shelter = shelters.find(s => s.id === dome.shelterId);
              if (shelter) {
                const squadron = squadrons.find(sq => sq.id === shelter.squadronId);
                if (squadron) {
                  const base = bases.find(b => b.id === squadron.baseId);
                  return base ? `${base.name} - ${squadron.name} - ${shelter.name}` : 'לא ידוע';
                }
              }
            }
          }
          return 'לא מוקצה';
        };

        planeMarker.bindPopup(`
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; min-width: 200px; direction: rtl;">
            <div style="font-weight: bold; margin-bottom: 4px; color: ${isSuspicious ? '#ef4444' : '#0ea5e9'};">
              ${plane.callsign}
            </div>
            <div style="font-size: 11px; margin-bottom: 2px;">סוג: ${plane.type}</div>
            <div style="font-size: 11px; margin-bottom: 2px;">
              מיקום: ${plane.location === 'air' ? 'באוויר' : 'על הקרקע'}
            </div>
            <div style="font-size: 11px; margin-bottom: 4px;">${getAircraftLocation()}</div>
            ${isSuspicious && plane.suspicionReason ? `
              <div style="margin-top: 6px; padding: 6px; background: #fee2e2; border: 1px solid #ef4444; border-radius: 4px;">
                <div style="font-weight: bold; font-size: 10px; color: #991b1b; margin-bottom: 2px;">סיבה לחשד:</div>
                <div style="font-size: 10px; color: #dc2626;">${plane.suspicionReason}</div>
              </div>
            ` : ''}
            ${plane.lastStatusUpdate ? `
              <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
                <div style="font-size: 10px;">עדכון אחרון: ${formatDate(plane.lastStatusUpdate)}</div>
                ${plane.lastStatusUpdatedBy ? `
                  <div style="font-size: 9px; margin-top: 2px;">
                    ${plane.lastStatusUpdatedBy.name} (${plane.lastStatusUpdatedBy.personalNumber})
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>
        `);

        planeMarkersRef.current.push(planeMarker);
      });
    } else {
      // Clear plane markers when zoomed out or no filter
      planeMarkersRef.current.forEach(marker => {
        mapRef.current?.removeLayer(marker);
      });
      planeMarkersRef.current = [];
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
  }, [bases, squadrons, shelters, domes, aircraft, zoomLevel, aircraftFilter, updateAircraftLocation]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: '500px' }} />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/20 to-transparent" />
      {/* לוגו חיל האוויר בפינה */}
      <div className="absolute top-4 right-4 pointer-events-auto z-[1000]">
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '2px solid #1e40af',
          borderRadius: '8px',
          padding: '8px 12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <img 
            src={airForceLogo}
            alt="חיל האוויר" 
            style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '50px' }}
            onError={(e) => {
              // אם התמונה לא נטענה, מציג SVG פשוט
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div style={{
            fontWeight: 700,
            fontSize: '14px',
            color: '#1e40af',
            direction: 'rtl',
          }}>חיל האוויר</div>
        </div>
      </div>
      
      {/* Modal לסימון מטוס כחשוד */}
      <Dialog open={suspicionModalOpen} onOpenChange={setSuspicionModalOpen}>
        <DialogContent style={{ direction: 'rtl' }}>
          <DialogHeader>
            <DialogTitle>סימון מטוס כחשוד</DialogTitle>
          </DialogHeader>
          <div style={{ marginTop: '16px' }}>
            <Label htmlFor="suspicion-reason" style={{ marginBottom: '8px', display: 'block' }}>
              מטוס: {selectedAircraftForSuspicion?.callsign}
            </Label>
            <Label htmlFor="suspicion-reason" style={{ marginBottom: '8px', display: 'block' }}>
              סיבה לסימון כחשוד:
            </Label>
            <Textarea
              id="suspicion-reason"
              value={suspicionReason}
              onChange={(e) => setSuspicionReason(e.target.value)}
              placeholder="הזן את הסיבה לסימון המטוס כחשוד..."
              style={{ minHeight: '100px', direction: 'rtl' }}
            />
          </div>
          <DialogFooter style={{ marginTop: '16px' }}>
            <Button
              variant="outline"
              onClick={() => {
                setSuspicionModalOpen(false);
                setSuspicionReason('');
                setSelectedAircraftForSuspicion(null);
              }}
            >
              ביטול
            </Button>
            <Button
              onClick={() => {
                if (selectedAircraftForSuspicion && suspicionReason.trim()) {
                  markAircraftAsSuspicious(selectedAircraftForSuspicion.id, suspicionReason.trim());
                  setSuspicionModalOpen(false);
                  setSuspicionReason('');
                  setSelectedAircraftForSuspicion(null);
                }
              }}
              disabled={!suspicionReason.trim()}
              style={{ background: '#ef4444', color: 'white' }}
            >
              אישור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
