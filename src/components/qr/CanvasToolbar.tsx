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
  Lock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';

interface CanvasToolbarProps {
  onAddLogo: (file: File) => void;
  onAddCenterLogo: (file: File) => void;
  onAddText: () => void;
  onAddShape: (type: 'rect' | 'circle') => void;
  onClear: () => void;
  onExport: (format: 'png' | 'jpeg' | 'svg') => void;
  isProUser?: boolean;
  onUpgradeRequired?: (feature: string) => void;
}

export function CanvasToolbar({
  onAddLogo,
  onAddCenterLogo,
  onAddText,
  onAddShape,
  onClear,
  onExport,
  isProUser = false,
  onUpgradeRequired,
}: CanvasToolbarProps) {
  const t = useTranslations('CanvasToolbar');
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

  const handleCenterLogoClick = () => {
    if (!isProUser && onUpgradeRequired) {
      onUpgradeRequired(t('centerLogo'));
      return;
    }
    centerLogoInputRef.current?.click();
  };

  const handleExportClick = (format: 'png' | 'jpeg' | 'svg') => {
    if ((format === 'jpeg' || format === 'svg') && !isProUser && onUpgradeRequired) {
      onUpgradeRequired(t('export'));
      return;
    }
    onExport(format);
  };

  return (
    <div className="flex items-center gap-2 p-3 border-b border-border bg-card overflow-x-auto no-scrollbar">
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
        onClick={handleCenterLogoClick}
        className="gap-1.5 relative whitespace-nowrap shrink-0"
      >
        <CircleDot className="h-4 w-4" />
        {t('centerLogo')}
        {!isProUser && <Lock className="h-3 w-3 absolute -top-1 -right-1 text-amber-500" />}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="gap-1.5 whitespace-nowrap shrink-0"
      >
        <ImageIcon className="h-4 w-4" />
        {t('addLogo')}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onAddText}
        className="gap-1.5 whitespace-nowrap shrink-0"
      >
        <Type className="h-4 w-4" />
        {t('addText')}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap shrink-0">
            <Square className="h-4 w-4" />
            {t('addShape')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onAddShape('rect')}>
            <Square className="h-4 w-4 mr-2" />
            {t('rectangle')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddShape('circle')}>
            <Circle className="h-4 w-4 mr-2" />
            {t('circle')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="gap-1.5 text-muted-foreground hover:text-destructive whitespace-nowrap shrink-0"
      >
        <RotateCcw className="h-4 w-4" />
        {t('clear')}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="gap-1.5 whitespace-nowrap shrink-0">
            <Download className="h-4 w-4" />
            {t('export')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExportClick('png')}>
            {t('downloadPng')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExportClick('jpeg')} className="flex items-center justify-between">
            {t('downloadJpeg')}
            {!isProUser && <Lock className="h-3 w-3 text-amber-500" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExportClick('svg')} className="flex items-center justify-between">
            {t('downloadSvg')}
            {!isProUser && <Lock className="h-3 w-3 text-amber-500" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
