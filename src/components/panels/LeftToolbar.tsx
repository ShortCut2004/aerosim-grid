import { useState } from 'react';
import { 
  Plane, 
  Layers,
  ChevronDown,
  Map,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useSimulationStore } from '@/hooks/useSimulationStore';
import { cn } from '@/lib/utils';
import { Aircraft } from '@/types/simulation';

interface LeftToolbarProps {
  viewMode: 'map' | 'list';
  onViewModeChange: (mode: 'map' | 'list') => void;
}

export const LeftToolbar = ({ viewMode, onViewModeChange }: LeftToolbarProps) => {
  const {
    tileLayerUrl,
    setTileLayerUrl,
    currentUser,
    aircraft,
    getUnassignedAircraft,
    bases,
    squadrons,
    shelters,
    domes,
    aircraftFilter,
    setAircraftFilter,
    updateAircraftLocation,
  } = useSimulationStore();

  const [isLayerOpen, setIsLayerOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState(tileLayerUrl);

  const isAdmin = currentUser?.role === 'admin';
  
  // Calculate aircraft by category
  // לכל כיפה אמור להיות מטוס - אם כיפה ריקה, המטוס שהיה אמור להיות שם נחשב באוויר או חשוד
  // מצא כיפות ריקות שאין להן מטוס שמוקצה אליהן
  const emptyDomesWithoutAircraft = domes.filter(d => {
    if (d.aircraftId !== null) return false; // כיפה תפוסה
    // בדוק אם יש מטוס שמוקצה לכיפה הזו
    const assignedAircraft = aircraft.find(a => a.assignedDomeId === d.id);
    return !assignedAircraft; // אין מטוס שמוקצה לכיפה הזו
  });
  
  // כל המטוסים = כל המטוסים ב-array + כיפות ריקות ללא מטוס (וירטואליים)
  // זה כולל: מטוסים באוויר, מטוסים בקרקע, מטוסים חשודים, וכיפות ריקות
  const allAircraftCount = aircraft.length + emptyDomesWithoutAircraft.length;
  const allAircraft = aircraft; // עבור הרשימה, נשתמש רק במטוסים הקיימים
  const suspiciousAircraft = aircraft.filter(a => a.locationUncertain === true);
  
  // מטוסים באוויר: 
  // 1. location === 'air' ו-!locationUncertain (גם אם יש assignedDomeId והכיפה תפוסה)
  // 2. יש assignedDomeId אבל הכיפה ריקה (dome.aircraftId === null) - נחשב באוויר (גם אם location === 'ground')
  // 3. יש assignedDomeId אבל הכיפה מכילה מטוס אחר (dome.aircraftId !== a.id) - נחשב באוויר
  const aircraftInAir = aircraft.filter(a => {
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
  
  // המספר הסופי של מטוסים באוויר = מטוסים באוויר + כיפות ריקות ללא מטוס
  // זה מסתנכרן עם ListView שסופר כיפות ריקות
  const totalAircraftInAir = aircraftInAir.length + emptyDomesWithoutAircraft.length;
  
  // מטוסים על הקרקע: 
  // כל מטוס שהכיפה שלו מכילה אותו (dome.aircraftId === a.id)
  // זה מסתנכרן עם ListView שסופר כיפות תפוסות
  const aircraftOnGround = aircraft.filter(a => {
    if (a.locationUncertain) return false; // מטוסים חשודים לא נכללים כאן
    if (a.assignedDomeId === null) return false;
    
    // בודקים אם הכיפה באמת מכילה את המטוס
    const dome = domes.find(d => d.id === a.assignedDomeId);
    if (!dome) return false;
    
    // אם הכיפה מכילה את המטוס הזה, הוא על הקרקע (לא משנה מה ה-location שלו)
    return dome.aircraftId === a.id;
  });
  
  // Get filtered aircraft list based on current filter
  const getFilteredAircraft = (): Aircraft[] => {
    if (aircraftFilter === 'all') {
      return allAircraft;
    } else if (aircraftFilter === 'suspicious') {
      return suspiciousAircraft;
    } else if (aircraftFilter === 'air') {
      // החזר את כל המטוסים באוויר
      return aircraftInAir;
    } else if (aircraftFilter === 'ground') {
      return aircraftOnGround;
    }
    return [];
  };

  const filteredAircraftList = getFilteredAircraft();
  
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
  
  const getAircraftLocation = (aircraft: Aircraft) => {
    if (aircraft.assignedDomeId) {
      const dome = domes.find(d => d.id === aircraft.assignedDomeId);
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

  const tilePresets = [
    { name: 'OpenStreetMap', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
    { name: 'CartoDB Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
    { name: 'Satellite (ESRI)', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    { name: 'Terrain', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
  ];

  return (
    <div className="w-72 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Plane className="w-5 h-5 text-primary" />
          <h1 className="font-semibold text-foreground">סימולטור מטוסים</h1>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={currentUser?.role === 'admin' ? 'tactical' : 'muted'}>
            {currentUser?.role || 'guest'}
          </Badge>
          <span className="text-xs text-muted-foreground">{currentUser?.username}</span>
        </div>
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'map' ? 'tactical' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('map')}
            className="flex-1"
          >
            <Map className="w-4 h-4 mr-2" />
            מפה
          </Button>
          <Button
            variant={viewMode === 'list' ? 'tactical' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="flex-1"
          >
            <List className="w-4 h-4 mr-2" />
            רשימה
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-border">
        <div className="panel-header">סטטוס</div>
        <div className="grid grid-cols-2 gap-2">
                 <button
                   onClick={() => setAircraftFilter('all')}
                   className={`bg-secondary hover:bg-secondary/80 rounded-md p-2 text-center cursor-pointer transition-colors ${
                     aircraftFilter === 'all' ? 'ring-2 ring-primary' : ''
                   }`}
                 >
                   <div className="text-xl font-mono font-bold text-primary">{allAircraftCount}</div>
                   <div className="text-xs text-muted-foreground">כל המטוסים</div>
                 </button>
          <button
            onClick={() => setAircraftFilter('suspicious')}
            className={`bg-secondary hover:bg-secondary/80 rounded-md p-2 text-center cursor-pointer transition-colors ${
              aircraftFilter === 'suspicious' ? 'ring-2 ring-red-500' : ''
            }`}
          >
            <div className="text-xl font-mono font-bold text-red-500">{suspiciousAircraft.length}</div>
            <div className="text-xs text-muted-foreground">חשודים</div>
          </button>
          <button
            onClick={() => setAircraftFilter('air')}
            className={`bg-secondary hover:bg-secondary/80 rounded-md p-2 text-center cursor-pointer transition-colors ${
              aircraftFilter === 'air' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="text-xl font-mono font-bold text-blue-500">{totalAircraftInAir}</div>
            <div className="text-xs text-muted-foreground">באוויר</div>
          </button>
          <button
            onClick={() => setAircraftFilter('ground')}
            className={`bg-secondary hover:bg-secondary/80 rounded-md p-2 text-center cursor-pointer transition-colors ${
              aircraftFilter === 'ground' ? 'ring-2 ring-green-500' : ''
            }`}
          >
            <div className="text-xl font-mono font-bold text-green-500">{aircraftOnGround.length}</div>
            <div className="text-xs text-muted-foreground">על הקרקע</div>
          </button>
        </div>
      </div>

      {/* Aircraft List in Sidebar */}
      {aircraftFilter && aircraftFilter !== 'all' ? (
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="p-4 border-b border-border">
            <div className="panel-header">
              {aircraftFilter === 'suspicious' ? 'מטוסים חשודים' : 
               aircraftFilter === 'air' ? 'מטוסים באוויר' : 
               'מטוסים על הקרקע'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              סה"כ {filteredAircraftList.length} מטוסים
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {filteredAircraftList.map((aircraft) => {
                const isSuspicious = aircraft.locationUncertain === true;
                const isDraggable = isSuspicious || aircraftFilter === 'air' || aircraftFilter === 'ground';
                
                return (
                  <div
                    key={aircraft.id}
                    className={`border rounded-lg p-3 hover:bg-secondary/50 transition-colors ${
                      isSuspicious ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''
                    }`}
                    draggable={isDraggable}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('aircraftId', aircraft.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-bold">{aircraft.callsign}</Badge>
                        <Badge variant="secondary">{aircraft.type}</Badge>
                        {isSuspicious ? (
                          <Badge variant="destructive">מיקום לא מעודכן</Badge>
                        ) : (
                          <Badge variant={aircraft.location === 'air' ? 'default' : 'outline'}>
                            {aircraft.location === 'air' ? 'באוויר' : 'על הקרקע'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        <span className="font-medium">מיקום:</span>{' '}
                        {isSuspicious ? 'לא ידוע' : getAircraftLocation(aircraft)}
                      </div>
                      {aircraft.lastStatusUpdate && (
                        <div>
                          <span className="font-medium">עדכון אחרון:</span>{' '}
                          {formatDate(aircraft.lastStatusUpdate)}
                          {aircraft.lastStatusUpdatedBy && (
                            <div className="text-xs mt-1">
                              {aircraft.lastStatusUpdatedBy.name} ({aircraft.lastStatusUpdatedBy.personalNumber})
                              {aircraft.lastStatusUpdatedBy.phone && (
                                <span className="ml-2">- {aircraft.lastStatusUpdatedBy.phone}</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {isDraggable && (
                        <div className="text-xs text-blue-500 mt-2 font-medium">
                          💡 גרור למפה לעדכון מיקום
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredAircraftList.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  אין מטוסים ברשימה
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      ) : (
        /* Spacer - only when no aircraft list is shown */
        <div className="flex-1" />
      )}

      {/* Tile Layer Settings - moved to bottom */}
      <Collapsible open={isLayerOpen} onOpenChange={setIsLayerOpen}>
        <CollapsibleTrigger asChild>
          <div className="p-4 border-t border-border cursor-pointer hover:bg-secondary/50 transition-colors flex items-center justify-between">
            <div className="panel-header mb-0">Map Layer</div>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              isLayerOpen && "rotate-180"
            )} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {tilePresets.map((preset) => (
                <Button
                  key={preset.name}
                  variant={tileLayerUrl === preset.url ? 'tactical' : 'outline'}
                  size="xs"
                  onClick={() => {
                    setTileLayerUrl(preset.url);
                    setCustomUrl(preset.url);
                  }}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Custom URL</Label>
              <div className="flex gap-2">
                <Input
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://..."
                  className="text-xs h-8"
                />
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setTileLayerUrl(customUrl)}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
