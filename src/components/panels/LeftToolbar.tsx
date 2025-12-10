import { useState } from 'react';
import { 
  Plane, 
  Settings, 
  Play, 
  Square, 
  RefreshCw, 
  Layers,
  MousePointer,
  Zap,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useSimulationStore } from '@/hooks/useSimulationStore';
import { cn } from '@/lib/utils';

export const LeftToolbar = () => {
  const {
    placementMode,
    setPlacementMode,
    selectedAlgorithm,
    setSelectedAlgorithm,
    algorithmParams,
    setAlgorithmParams,
    tileLayerUrl,
    setTileLayerUrl,
    runAutoDistribute,
    clearAllAssignments,
    currentUser,
    aircraft,
    getUnassignedAircraft,
  } = useSimulationStore();

  const [isAlgoOpen, setIsAlgoOpen] = useState(true);
  const [isLayerOpen, setIsLayerOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState(tileLayerUrl);

  const isAdmin = currentUser?.role === 'admin';
  const unassignedCount = getUnassignedAircraft().length;
  const assignedCount = aircraft.filter(a => a.assignedPositionId !== null).length;

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
          <h1 className="font-semibold text-foreground">Aircraft Simulator</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={currentUser?.role === 'admin' ? 'tactical' : 'muted'}>
            {currentUser?.role || 'guest'}
          </Badge>
          <span className="text-xs text-muted-foreground">{currentUser?.username}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-border">
        <div className="panel-header">Status</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-secondary rounded-md p-2 text-center">
            <div className="text-xl font-mono font-bold text-primary">{assignedCount}</div>
            <div className="text-xs text-muted-foreground">Assigned</div>
          </div>
          <div className="bg-secondary rounded-md p-2 text-center">
            <div className="text-xl font-mono font-bold text-accent">{unassignedCount}</div>
            <div className="text-xs text-muted-foreground">Unassigned</div>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="p-4 border-b border-border">
        <div className="panel-header">Placement Mode</div>
        <div className="flex gap-2">
          <Button
            variant={placementMode === 'manual' ? 'tactical' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => setPlacementMode('manual')}
            disabled={!isAdmin}
          >
            <MousePointer className="w-4 h-4" />
            Manual
          </Button>
          <Button
            variant={placementMode === 'automatic' ? 'tactical' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => setPlacementMode('automatic')}
            disabled={!isAdmin}
          >
            <Zap className="w-4 h-4" />
            Auto
          </Button>
        </div>
      </div>

      {/* Algorithm Settings */}
      <Collapsible open={isAlgoOpen} onOpenChange={setIsAlgoOpen}>
        <CollapsibleTrigger asChild>
          <div className="p-4 border-b border-border cursor-pointer hover:bg-secondary/50 transition-colors flex items-center justify-between">
            <div className="panel-header mb-0">Algorithm Settings</div>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              isAlgoOpen && "rotate-180"
            )} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Algorithm</Label>
              <Select
                value={selectedAlgorithm}
                onValueChange={(v) => setSelectedAlgorithm(v as any)}
                disabled={!isAdmin}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spread-evenly">Spread Evenly</SelectItem>
                  <SelectItem value="cluster">Cluster</SelectItem>
                  <SelectItem value="minimize-distance">Minimize Distance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Max Per Position (0 = use capacity)
              </Label>
              <Slider
                value={[algorithmParams.maxPerPosition]}
                onValueChange={([v]) => setAlgorithmParams({ maxPerPosition: v })}
                min={0}
                max={10}
                step={1}
                disabled={!isAdmin}
              />
              <div className="text-xs text-muted-foreground mt-1 text-right font-mono">
                {algorithmParams.maxPerPosition || 'Auto'}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="tactical"
                size="sm"
                className="flex-1"
                onClick={runAutoDistribute}
                disabled={!isAdmin || placementMode !== 'automatic'}
              >
                <Play className="w-4 h-4" />
                Run
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllAssignments}
                disabled={!isAdmin}
              >
                <RefreshCw className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Tile Layer Settings */}
      <Collapsible open={isLayerOpen} onOpenChange={setIsLayerOpen}>
        <CollapsibleTrigger asChild>
          <div className="p-4 border-b border-border cursor-pointer hover:bg-secondary/50 transition-colors flex items-center justify-between">
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

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          Synthetic Data Only - Test Region A
        </div>
      </div>
    </div>
  );
};
