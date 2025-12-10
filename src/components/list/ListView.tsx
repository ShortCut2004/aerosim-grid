import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSimulationStore } from '@/hooks/useSimulationStore';
import { Badge } from '@/components/ui/badge';

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const ListView = () => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
  const { bases, squadrons, shelters, domes } = useSimulationStore();

  // Calculate statistics for each base
  const baseStats = bases.map((base) => {
    // Get all squadrons for this base
    const baseSquadrons = squadrons.filter(sq => sq.baseId === base.id);
    
    // Get all shelters for these squadrons
    const baseShelters = shelters.filter(sh => 
      baseSquadrons.some(sq => sq.id === sh.squadronId)
    );
    
    // Get all domes for these shelters
    const baseDomes = domes.filter(d => 
      baseShelters.some(sh => sh.id === d.shelterId)
    );
    
    // Count occupied and empty domes
    const occupiedDomes = baseDomes.filter(d => d.aircraftId !== null);
    const emptyDomes = baseDomes.filter(d => d.aircraftId === null);
    const totalDomes = baseDomes.length;
    
    // Group by aircraft type
    const aircraftByType: Record<string, { total: number; occupied: number; empty: number }> = {};
    
    baseShelters.forEach(shelter => {
      const shelterDomes = baseDomes.filter(d => d.shelterId === shelter.id);
      const shelterOccupied = shelterDomes.filter(d => d.aircraftId !== null).length;
      const shelterEmpty = shelterDomes.filter(d => d.aircraftId === null).length;
      
      if (!aircraftByType[shelter.aircraftType]) {
        aircraftByType[shelter.aircraftType] = { total: 0, occupied: 0, empty: 0 };
      }
      
      aircraftByType[shelter.aircraftType].total += shelterDomes.length;
      aircraftByType[shelter.aircraftType].occupied += shelterOccupied;
      aircraftByType[shelter.aircraftType].empty += shelterEmpty;
    });
    
    return {
      base,
      totalDomes,
      occupiedDomes: occupiedDomes.length,
      emptyDomes: emptyDomes.length,
      aircraftByType,
    };
  });

  const getAircraftTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fighter: 'מטוסי קרב',
      bomber: 'מטוסי הפצצה',
      transport: 'מטוסי תובלה',
      recon: 'מטוסי סיור',
      helicopter: 'מסוקים',
    };
    return labels[type] || type;
  };

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map with minimal tile layer (terrain only, no labels)
    const defaultCenter: L.LatLngExpression = [31.0461, 34.8516];
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView(defaultCenter, 8);
    mapRef.current = map;

    // Use Satellite tile layer (ESRI World Imagery)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
      maxZoom: 18,
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    markersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Calculate statistics and create markers for each base
    bases.forEach((base) => {
      // Get all squadrons for this base
      const baseSquadrons = squadrons.filter(sq => sq.baseId === base.id);
      
      // Get all shelters for these squadrons
      const baseShelters = shelters.filter(sh => 
        baseSquadrons.some(sq => sq.id === sh.squadronId)
      );
      
      // Get all domes for these shelters
      const baseDomes = domes.filter(d => 
        baseShelters.some(sh => sh.id === d.shelterId)
      );
      
      // Count occupied and empty domes
      const occupiedDomes = baseDomes.filter(d => d.aircraftId !== null).length;
      const emptyDomes = baseDomes.filter(d => d.aircraftId === null).length;
      const totalDomes = baseDomes.length;
      
      // Group by aircraft type
      const aircraftByType: Record<string, { total: number; occupied: number; empty: number }> = {};
      
      baseShelters.forEach(shelter => {
        const shelterDomes = baseDomes.filter(d => d.shelterId === shelter.id);
        const shelterOccupied = shelterDomes.filter(d => d.aircraftId !== null).length;
        const shelterEmpty = shelterDomes.filter(d => d.aircraftId === null).length;
        
        if (!aircraftByType[shelter.aircraftType]) {
          aircraftByType[shelter.aircraftType] = { total: 0, occupied: 0, empty: 0 };
        }
        
        aircraftByType[shelter.aircraftType].total += shelterDomes.length;
        aircraftByType[shelter.aircraftType].occupied += shelterOccupied;
        aircraftByType[shelter.aircraftType].empty += shelterEmpty;
      });

      // Create HTML content for the marker popup
      const aircraftTypeBreakdown = Object.entries(aircraftByType)
        .map(([type, stats]) => 
          `<div class="text-xs mb-1">
            <span class="font-semibold">${getAircraftTypeLabel(type)}:</span>
            <span class="text-gray-600 dark:text-gray-400 ml-2">${stats.empty} פנוי</span>
            <span class="text-green-600 dark:text-green-400 ml-2">${stats.occupied} תפוס</span>
            <span class="font-semibold ml-2">${stats.total} סה"כ</span>
          </div>`
        )
        .join('');

      const popupContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-width: 200px; direction: rtl;">
          <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px; color: #000000;">${base.name}</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;">
            <div style="background: #e5e7eb; padding: 8px; border-radius: 6px; text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #374151;">${emptyDomes}</div>
              <div style="font-size: 10px; color: #6b7280; margin-top: 4px;">פנוי</div>
            </div>
            <div style="background: #bbf7d0; padding: 8px; border-radius: 6px; text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #166534;">${occupiedDomes}</div>
              <div style="font-size: 10px; color: #15803d; margin-top: 4px;">תפוס</div>
            </div>
            <div style="background: #bfdbfe; padding: 8px; border-radius: 6px; text-align: center;">
              <div style="font-size: 20px; font-weight: bold; color: #1e40af;">${totalDomes}</div>
              <div style="font-size: 10px; color: #2563eb; margin-top: 4px;">סה"כ</div>
            </div>
          </div>
          ${aircraftTypeBreakdown ? `<div style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
            <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px;">פירוט לפי סוג כלי טיס:</div>
            ${aircraftTypeBreakdown}
          </div>` : ''}
        </div>
      `;

      // Create custom icon with summary box
      const iconHtml = `
        <div style="
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          padding: 8px;
          min-width: 80px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          direction: rtl;
        ">
          <div style="font-weight: bold; font-size: 11px; margin-bottom: 4px; text-align: center; color: #000000;">${base.name}</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;">
            <div style="background: #e5e7eb; padding: 4px; border-radius: 4px; text-align: center;">
              <div style="font-size: 14px; font-weight: bold; color: #374151;">${emptyDomes}</div>
              <div style="font-size: 8px; color: #6b7280;">פנוי</div>
            </div>
            <div style="background: #bbf7d0; padding: 4px; border-radius: 4px; text-align: center;">
              <div style="font-size: 14px; font-weight: bold; color: #166534;">${occupiedDomes}</div>
              <div style="font-size: 8px; color: #15803d;">תפוס</div>
            </div>
            <div style="background: #bfdbfe; padding: 4px; border-radius: 4px; text-align: center;">
              <div style="font-size: 14px; font-weight: bold; color: #1e40af;">${totalDomes}</div>
              <div style="font-size: 8px; color: #2563eb;">סה"כ</div>
            </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'base-marker-icon',
        iconSize: [100, 80],
        iconAnchor: [50, 40],
      });

      // Add offset to prevent overlapping markers - use a circular/spiral pattern
      // Calculate angle and distance for each base to spread them evenly
      const baseIndex = bases.findIndex(b => b.id === base.id);
      const totalBases = bases.length;
      const angle = (baseIndex / totalBases) * 2 * Math.PI; // Distribute in a circle
      const distance = 0.05; // Distance from center in degrees
      const offsetLat = Math.cos(angle) * distance;
      const offsetLon = Math.sin(angle) * distance;
      
      const marker = L.marker([base.latitude + offsetLat, base.longitude + offsetLon], {
        icon: customIcon,
      }).addTo(mapRef.current);

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Fit map to show all bases with more padding
    if (bases.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(bases.map(b => [b.latitude, b.longitude]));
      mapRef.current.fitBounds(bounds, { padding: [100, 100] });
    }
  }, [bases, squadrons, shelters, domes]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: '500px' }} />
    </div>
  );
};

