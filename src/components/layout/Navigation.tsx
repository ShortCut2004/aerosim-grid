import { Link, useLocation } from 'react-router-dom';
import { Map, Table2, Shield, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSimulationStore } from '@/hooks/useSimulationStore';
import { cn } from '@/lib/utils';

export const Navigation = () => {
  const location = useLocation();
  const { currentUser, setCurrentUser } = useSimulationStore();

  const navItems = [
    { path: '/', label: 'Map View', icon: Map },
    { path: '/admin/table', label: 'Table View', icon: Table2, adminOnly: true },
  ];

  const toggleRole = () => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: currentUser.role === 'admin' ? 'viewer' : 'admin',
        username: currentUser.role === 'admin' ? 'viewer' : 'admin',
      });
    }
  };

  return (
    <header className="h-12 bg-card border-b border-border px-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">ACSIM</span>
        </div>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            if (item.adminOnly && currentUser?.role !== 'admin') return null;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                asChild
                className={cn(
                  'gap-2',
                  isActive && 'bg-secondary'
                )}
              >
                <Link to={item.path}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              <span className="font-mono text-xs">{currentUser?.username}</span>
              <Badge
                variant={currentUser?.role === 'admin' ? 'tactical' : 'muted'}
                className="text-xs"
              >
                {currentUser?.role}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={toggleRole}>
              Switch to {currentUser?.role === 'admin' ? 'Viewer' : 'Admin'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
