import { useState } from 'react';
import { TacticalMap } from '@/components/map/TacticalMap';
import { ListView } from '@/components/list/ListView';
import { LeftToolbar } from '@/components/panels/LeftToolbar';

const MapPage = () => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Main Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Toolbar */}
        <LeftToolbar viewMode={viewMode} onViewModeChange={setViewMode} />

        {/* Map or List Area */}
        <div className="flex-1 relative min-h-[400px]">
          {viewMode === 'map' ? (
            <TacticalMap />
          ) : (
            <ListView />
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
