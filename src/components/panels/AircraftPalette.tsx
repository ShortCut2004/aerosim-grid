import { useState } from 'react';
import { Plane, Search, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSimulationStore } from '@/hooks/useSimulationStore';
import { Aircraft } from '@/types/simulation';
import { cn } from '@/lib/utils';

interface AircraftCardProps {
  aircraft: Aircraft;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}

const AircraftCard = ({ aircraft, isSelected, onClick, onDoubleClick }: AircraftCardProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fighter': return '✈️';
      case 'bomber': return '🛩️';
      case 'transport': return '🛫';
      case 'recon': return '🔍';
      case 'helicopter': return '🚁';
      default: return '✈️';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'assigned': return 'success';
      case 'unassigned': return 'accent';
      case 'maintenance': return 'warning';
      case 'deployed': return 'tactical';
      default: return 'muted';
    }
  };

  return (
    <div
      className={cn(
        "p-3 bg-secondary rounded-md cursor-pointer transition-all duration-200",
        "hover:bg-secondary/80 hover:scale-[1.02]",
        isSelected && "ring-2 ring-primary bg-primary/10"
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getTypeIcon(aircraft.type)}</span>
          <div>
            <div className="font-mono text-sm font-semibold text-foreground">
              {aircraft.callsign}
            </div>
            <div className="text-xs text-muted-foreground">
              {aircraft.type} • {aircraft.size}
            </div>
          </div>
        </div>
        <Badge variant={getStatusVariant(aircraft.status) as any} className="text-xs">
          {aircraft.status}
        </Badge>
      </div>
    </div>
  );
};

export const AircraftPalette = () => {
  const {
    aircraft,
    selectedAircraftId,
    selectAircraft,
    selectedPositionId,
    assignAircraft,
    currentUser,
    getUnassignedAircraft,
  } = useSimulationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(true);

  const isAdmin = currentUser?.role === 'admin';

  const filteredAircraft = aircraft.filter((a) => {
    const matchesSearch = a.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDoubleClick = (aircraftItem: Aircraft) => {
    if (isAdmin && selectedPositionId && aircraftItem.status === 'unassigned') {
      assignAircraft(aircraftItem.id, selectedPositionId);
    }
  };

  const unassignedCount = getUnassignedAircraft().length;

  return (
    <div className={cn(
      "bg-card border-t border-border transition-all duration-300",
      isExpanded ? "h-56" : "h-12"
    )}>
      {/* Header */}
      <div 
        className="h-12 px-4 flex items-center justify-between border-b border-border cursor-pointer hover:bg-secondary/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Plane className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Aircraft Palette</span>
          <Badge variant="muted" className="font-mono">
            {unassignedCount} available
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </Button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="h-[calc(100%-3rem)] flex flex-col">
          {/* Filters */}
          <div className="p-3 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search callsign..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="fighter">Fighter</SelectItem>
                <SelectItem value="bomber">Bomber</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="recon">Recon</SelectItem>
                <SelectItem value="helicopter">Helicopter</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            {isAdmin && (
              <div className="text-xs text-muted-foreground ml-auto">
                Double-click to assign to selected position
              </div>
            )}
          </div>

          {/* Aircraft Grid */}
          <ScrollArea className="flex-1 p-3">
            <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
              {filteredAircraft.map((a) => (
                <AircraftCard
                  key={a.id}
                  aircraft={a}
                  isSelected={selectedAircraftId === a.id}
                  onClick={() => selectAircraft(a.id)}
                  onDoubleClick={() => handleDoubleClick(a)}
                />
              ))}
            </div>
            {filteredAircraft.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                No aircraft match your filters
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
