import { TacticalMap } from '@/components/map/TacticalMap';
import { LeftToolbar } from '@/components/panels/LeftToolbar';
import { RightSidePanel } from '@/components/panels/RightSidePanel';

const MapPage = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Main Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Toolbar */}
        <LeftToolbar />

        {/* Map Area */}
        <div className="flex-1 relative min-h-[400px]">
          <TacticalMap />
        </div>

        {/* Right Side Panel */}
        <RightSidePanel />
      </div>
    </div>
  );
};

export default MapPage;
