import { Button } from '@/components/ui/button';
import { Check, X, Mail, Download, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BulkActionsProps {
  selectedCount: number;
  onShortlist?: () => void;
  onRemoveShortlist?: () => void;
  onEmail?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
}

export function BulkActions({
  selectedCount,
  onShortlist,
  onRemoveShortlist,
  onEmail,
  onExport,
  onDelete,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-card border shadow-lg rounded-lg p-3 flex items-center gap-3">
        <p className="text-sm font-medium px-2">
          {selectedCount} selected
        </p>
        <div className="flex gap-2">
          {onShortlist && (
            <Button size="sm" onClick={onShortlist}>
              <Check className="h-4 w-4 mr-2" />
              Shortlist
            </Button>
          )}
          {onRemoveShortlist && (
            <Button size="sm" variant="outline" onClick={onRemoveShortlist}>
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEmail && (
                <DropdownMenuItem onClick={onEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </DropdownMenuItem>
              )}
              {onExport && (
                <DropdownMenuItem onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}


