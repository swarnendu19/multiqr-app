import { CanvasLayer } from '@/hooks/useCanvas';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ChevronUp,
  ChevronDown,
  QrCode,
  Image,
  Type,
  Square,
  CircleDot,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayerPanelProps {
  layers: CanvasLayer[];
  selectedLayerId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

const layerIcons: Record<CanvasLayer['type'], React.ComponentType<{ className?: string }>> = {
  qr: QrCode,
  logo: Image,
  text: Type,
  shape: Square,
  frame: Square,
  'center-logo': CircleDot,
};

export function LayerPanel({
  layers,
  selectedLayerId,
  onSelect,
  onDelete,
  onToggleVisibility,
  onToggleLock,
  onMoveUp,
  onMoveDown,
}: LayerPanelProps) {
  // Reverse layers for display (top layer first)
  const displayLayers = [...layers].reverse();

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-sm font-semibold">Layers</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {displayLayers.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No layers yet. Add a QR code, logo, or text.
            </p>
          ) : (
            displayLayers.map((layer, displayIndex) => {
              const Icon = layerIcons[layer.type];
              const isSelected = layer.id === selectedLayerId;
              const actualIndex = layers.length - 1 - displayIndex;

              return (
                <div
                  key={layer.id}
                  className={cn(
                    'group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                    isSelected
                      ? 'bg-secondary/20 border border-secondary/50'
                      : 'hover:bg-muted/50 border border-transparent'
                  )}
                  onClick={() => onSelect(layer.id)}
                >
                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  
                  <span
                    className={cn(
                      'flex-1 text-sm truncate',
                      !layer.visible && 'text-muted-foreground/50',
                      layer.locked && 'text-muted-foreground'
                    )}
                  >
                    {layer.name}
                  </span>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp(layer.id);
                      }}
                      disabled={actualIndex === layers.length - 1}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown(layer.id);
                      }}
                      disabled={actualIndex === 0}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(layer.id);
                    }}
                  >
                    {layer.visible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLock(layer.id);
                    }}
                  >
                    {layer.locked ? (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Unlock className="h-3 w-3" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(layer.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
