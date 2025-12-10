import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Upload,
  Save,
  Plus,
  Trash2,
  Search,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useSimulationStore } from '@/hooks/useSimulationStore';
import { toast } from '@/hooks/use-toast';
import { TableRow as TableRowType } from '@/types/simulation';
import { cn } from '@/lib/utils';

const AdminTablePage = () => {
  const {
    bases,
    positions,
    aircraft,
    getAssignedAircraft,
    currentUser,
    assignAircraft,
    unassignAircraft,
  } = useSimulationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  // Transform data into table rows
  const tableRows: TableRowType[] = useMemo(() => {
    return positions.map((position) => {
      const base = bases.find((b) => b.id === position.baseId);
      const assigned = getAssignedAircraft(position.id);
      return {
        id: position.id,
        base: base?.name || 'Unknown',
        positionName: position.name,
        capacity: position.capacity,
        assignedAircraft: assigned.map((a) => a.callsign),
        notes: notes[position.id] || '',
      };
    });
  }, [positions, bases, aircraft, notes, getAssignedAircraft]);

  // Filter rows
  const filteredRows = tableRows.filter((row) => {
    const query = searchQuery.toLowerCase();
    return (
      row.base.toLowerCase().includes(query) ||
      row.positionName.toLowerCase().includes(query) ||
      row.assignedAircraft.some((a) => a.toLowerCase().includes(query))
    );
  });

  // Group by base
  const groupedRows = filteredRows.reduce((acc, row) => {
    if (!acc[row.base]) acc[row.base] = [];
    acc[row.base].push(row);
    return acc;
  }, {} as Record<string, TableRowType[]>);

  const handleExportCSV = () => {
    const headers = ['Base', 'Position', 'Capacity', 'Assigned Aircraft', 'Notes'];
    const csvRows = [
      headers.join(','),
      ...tableRows.map((row) =>
        [
          row.base,
          row.positionName,
          row.capacity,
          `"${row.assignedAircraft.join('; ')}"`,
          `"${row.notes}"`,
        ].join(',')
      ),
    ];
    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aircraft_assignments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'CSV exported successfully' });
  };

  const handleImportCSV = () => {
    // Parse CSV and update assignments
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      toast({ title: 'Invalid CSV format', variant: 'destructive' });
      return;
    }

    // Skip header
    const dataLines = lines.slice(1);
    let updatedCount = 0;

    dataLines.forEach((line) => {
      const parts = line.split(',');
      if (parts.length >= 4) {
        const positionName = parts[1].trim();
        const aircraftStr = parts[3].replace(/"/g, '').trim();
        const position = positions.find((p) => p.name === positionName);
        
        if (position) {
          // Update notes if present
          if (parts.length >= 5) {
            const noteValue = parts[4].replace(/"/g, '').trim();
            setNotes((prev) => ({ ...prev, [position.id]: noteValue }));
          }
          updatedCount++;
        }
      }
    });

    toast({ title: `Imported ${updatedCount} rows` });
    setImportDialogOpen(false);
    setCsvContent('');
  };

  const handleSaveNotes = (positionId: string, value: string) => {
    setNotes((prev) => ({ ...prev, [positionId]: value }));
    setEditingCell(null);
    toast({ title: 'Notes saved' });
  };

  const handleRemoveAircraft = (callsign: string) => {
    const ac = aircraft.find((a) => a.callsign === callsign);
    if (ac) {
      unassignAircraft(ac.id);
      toast({ title: `Removed ${callsign}` });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You need admin privileges to access this page.
          </p>
          <Button asChild>
            <Link to="/">Return to Map</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Aircraft Assignments</h1>
            <p className="text-xs text-muted-foreground">Admin Table View</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="tactical" className="font-mono">
            {tableRows.length} positions
          </Badge>
          <Badge variant="accent" className="font-mono">
            {aircraft.filter((a) => a.assignedPositionId).length} assigned
          </Badge>
        </div>
      </header>

      {/* Toolbar */}
      <div className="h-14 border-b border-border bg-card/50 px-6 flex items-center gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bases, positions, aircraft..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex-1" />
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import CSV</DialogTitle>
              <DialogDescription>
                Paste CSV content with format: Base, Position, Capacity, Aircraft, Notes
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Paste CSV content here..."
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImportCSV}>Import</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {Object.entries(groupedRows).map(([baseName, rows]) => (
            <div key={baseName} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-foreground">{baseName}</h2>
                <Badge variant="muted">{rows.length} positions</Badge>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead className="w-40">Position</TableHead>
                      <TableHead className="w-24 text-center">Capacity</TableHead>
                      <TableHead>Assigned Aircraft</TableHead>
                      <TableHead className="w-64">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id} className="hover:bg-secondary/30">
                        <TableCell className="font-mono font-medium">
                          {row.positionName}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span
                              className={cn(
                                'font-mono font-bold',
                                row.assignedAircraft.length >= row.capacity
                                  ? 'text-destructive'
                                  : row.assignedAircraft.length > 0
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {row.assignedAircraft.length}
                            </span>
                            <span className="text-muted-foreground">/</span>
                            <span className="font-mono">{row.capacity}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {row.assignedAircraft.length === 0 ? (
                              <span className="text-muted-foreground text-sm">—</span>
                            ) : (
                              row.assignedAircraft.map((callsign) => (
                                <Badge
                                  key={callsign}
                                  variant="secondary"
                                  className="font-mono text-xs cursor-pointer hover:bg-destructive/20 hover:text-destructive group"
                                  onClick={() => handleRemoveAircraft(callsign)}
                                >
                                  {callsign}
                                  <Trash2 className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100" />
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {editingCell?.rowId === row.id && editingCell?.field === 'notes' ? (
                            <div className="flex gap-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-8 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveNotes(row.id, editValue);
                                  } else if (e.key === 'Escape') {
                                    setEditingCell(null);
                                  }
                                }}
                              />
                              <Button
                                size="xs"
                                onClick={() => handleSaveNotes(row.id, editValue)}
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div
                              className="text-sm text-muted-foreground cursor-pointer hover:text-foreground min-h-[24px]"
                              onClick={() => {
                                setEditingCell({ rowId: row.id, field: 'notes' });
                                setEditValue(row.notes);
                              }}
                            >
                              {row.notes || <span className="italic">Click to add notes...</span>}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}

          {Object.keys(groupedRows).length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No positions match your search</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AdminTablePage;
