import { X, Plane, MapPin, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useSimulationStore } from '@/hooks/useSimulationStore';
import { zoomToBase } from '@/components/map/TacticalMap';
import { cn } from '@/lib/utils';

export const RightSidePanel = () => {
  const {
    positions,
    bases,
    selectedPositionId,
    selectPosition,
    getAssignedAircraft,
    getAvailableCapacity,
    unassignAircraft,
    currentUser,
    getUnassignedAircraft,
    assignAircraft,
  } = useSimulationStore();
  
  const handleBaseClick = (baseId: string) => {
    zoomToBase(baseId, bases);
  };

  const selectedPosition = positions.find((p) => p.id === selectedPositionId);
  const base = selectedPosition ? bases.find((b) => b.id === selectedPosition.baseId) : null;
  const assignedAircraft = selectedPosition ? getAssignedAircraft(selectedPosition.id) : [];
  const availableCapacity = selectedPosition ? getAvailableCapacity(selectedPosition.id) : 0;
  const unassignedAircraft = getUnassignedAircraft();
  const isAdmin = currentUser?.role === 'admin';

  if (!selectedPosition) {
    return (
      <div className="w-80 bg-card border-l border-border flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-sm">
              Select a position on the map to view details
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hardpoint': return 'destructive';
      case 'hangar': return 'accent';
      case 'apron': return 'success';
      case 'runway': return 'warning';
      default: return 'muted';
    }
  };

  const handleQuickAssign = (aircraftId: string) => {
    if (selectedPosition) {
      assignAircraft(aircraftId, selectedPosition.id);
    }
  };

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-foreground">{selectedPosition.name}</h2>
          <Button variant="ghost" size="icon" onClick={() => selectPosition(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getTypeColor(selectedPosition.type) as any}>
            {selectedPosition.type}
          </Badge>
          {base && (
            <span 
              className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors"
              onClick={() => handleBaseClick(base.id)}
              title="Click to zoom to base"
            >
              {base.name}
            </span>
          )}
        </div>
      </div>

      {/* Capacity */}
      <div className="p-4 border-b border-border">
        <div className="panel-header">Capacity</div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  availableCapacity === 0 ? "bg-destructive" :
                  availableCapacity <= 1 ? "bg-warning" : "bg-success"
                )}
                style={{
                  width: `${((selectedPosition.capacity - availableCapacity) / selectedPosition.capacity) * 100}%`
                }}
              />
            </div>
          </div>
          <div className="font-mono text-sm">
            <span className="text-primary">{assignedAircraft.length}</span>
            <span className="text-muted-foreground">/{selectedPosition.capacity}</span>
          </div>
        </div>
        {availableCapacity === 0 && (
          <div className="flex items-center gap-2 mt-2 text-xs text-destructive">
            <AlertCircle className="w-3 h-3" />
            <span>Position at full capacity</span>
          </div>
        )}
      </div>

      {/* Coordinates */}
      <div className="p-4 border-b border-border">
        <div className="panel-header">Coordinates</div>
        <div className="font-mono text-xs text-muted-foreground space-y-1">
          <div>LAT: {selectedPosition.latitude.toFixed(6)}</div>
          <div>LON: {selectedPosition.longitude.toFixed(6)}</div>
        </div>
      </div>

      {/* Assigned Aircraft */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 pb-2">
          <div className="panel-header flex items-center gap-2">
            <Plane className="w-3 h-3" />
            Assigned Aircraft ({assignedAircraft.length})
          </div>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 pb-4">
            {assignedAircraft.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">
                No aircraft assigned
              </div>
            ) : (
              assignedAircraft.map((aircraft) => (
                <div
                  key={aircraft.id}
                  className="flex items-center justify-between p-2 bg-secondary rounded-md"
                >
                  <div>
                    <div className="font-mono text-sm font-semibold text-foreground">
                      {aircraft.callsign}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {aircraft.type} • {aircraft.size}
                    </div>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => unassignAircraft(aircraft.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Quick Assign */}
      {isAdmin && availableCapacity > 0 && unassignedAircraft.length > 0 && (
        <div className="p-4 border-t border-border">
          <div className="panel-header">Quick Assign</div>
          <ScrollArea className="h-24">
            <div className="flex flex-wrap gap-1">
              {unassignedAircraft.slice(0, 10).map((aircraft) => (
                <Button
                  key={aircraft.id}
                  variant="outline"
                  size="xs"
                  onClick={() => handleQuickAssign(aircraft.id)}
                  className="font-mono"
                >
                  {aircraft.callsign}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
