import { useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Image as ImageIcon,
  Type,
  Square,
  Circle,
  Download,
  RotateCcw,
  CircleDot,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CanvasToolbarProps {
  onAddLogo: (file: File) => void;
  onAddCenterLogo: (file: File) => void;
  onAddText: () => void;
  onAddShape: (type: 'rect' | 'circle') => void;
  onClear: () => void;
  onExport: (format: 'png' | 'jpeg' | 'svg') => void;
}

export function CanvasToolbar({
  onAddLogo,
  onAddCenterLogo,
  onAddText,
  onAddShape,
  onClear,
  onExport,
}: CanvasToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const centerLogoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddLogo(file);
      e.target.value = '';
    }
  };

  const handleCenterLogoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddCenterLogo(file);
      e.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 border-b border-border bg-card">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={centerLogoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCenterLogoSelect}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => centerLogoInputRef.current?.click()}
        className="gap-1.5"
      >
        <CircleDot className="h-4 w-4" />
        Center Logo
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="gap-1.5"
      >
        <ImageIcon className="h-4 w-4" />
        Add Logo
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onAddText}
        className="gap-1.5"
      >
        <Type className="h-4 w-4" />
        Add Text
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Square className="h-4 w-4" />
            Add Shape
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onAddShape('rect')}>
            <Square className="h-4 w-4 mr-2" />
            Rectangle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddShape('circle')}>
            <Circle className="h-4 w-4 mr-2" />
            Circle
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="gap-1.5 text-muted-foreground hover:text-destructive"
      >
        <RotateCcw className="h-4 w-4" />
        Clear
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onExport('png')}>
            Download PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport('jpeg')}>
            Download JPEG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport('svg')}>
            Download SVG
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
