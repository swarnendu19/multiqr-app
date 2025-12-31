"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useQRProjects } from '@/hooks/useQRProjects';
import { useCanvas } from '@/hooks/useCanvas';
import { QRProject, QRContent, QRDesign, QRType, defaultDesign as baseDefaultDesign, frameTemplates, FrameTemplate, DotStyle, CornerStyle } from '@/types/qr';
import { generateQRDataURL } from '@/lib/qr-generator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CanvasToolbar } from '@/components/qr/CanvasToolbar';
import { LayerPanel } from '@/components/qr/LayerPanel';
import { Loader2, Save, ArrowLeft, Palette, FileText, Settings, Layers, Sparkles, Frame, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { useTranslations } from 'next-intl';

const defaultDesign: QRDesign = {
    ...baseDefaultDesign,
    errorCorrection: 'Q', // Higher error correction by default for better logo support
};

export default function QREditor() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const { user, loading: authLoading, isProUser } = useAuth();
    const { getProject, updateProject } = useQRProjects();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [project, setProject] = useState<QRProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [content, setContent] = useState<QRContent>({});
    const [design, setDesign] = useState<QRDesign>(defaultDesign);
    const [name, setName] = useState('');
    const [activeTab, setActiveTab] = useState('content');

    const t = useTranslations('Editor');
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [upgradeModalTitle, setUpgradeModalTitle] = useState(t('upgradeTitle'));
    const [upgradeModalDesc, setUpgradeModalDesc] = useState(t('upgradeDesc'));

    const canvasOptions = useRef({ width: 400, height: 400, backgroundColor: '#ffffff' }).current;

    const {
        canvas,
        layers,
        selectedLayerId,
        updateQRCode,
        updateFrame,
        addLogo,
        addCenterLogo,
        addText,
        addShape,
        selectLayer,
        deleteLayer,
        toggleLayerVisibility,
        toggleLayerLock,
        moveLayer,
        exportCanvas,
        clearCanvas,
        getCanvasJSON,
    } = useCanvas(canvasRef, canvasOptions, [loading]);

    const handleUpgradeRequired = (feature: string) => {
        setUpgradeModalTitle(t('unlockFeature', { feature }));
        setUpgradeModalDesc(t('unlockDesc', { feature }));
        setUpgradeModalOpen(true);
    };

    const handleSave = async () => {
        if (!id) return;

        // Capture data BEFORE state updates to avoid canvas disposal issues
        canvas?.renderAll();
        const canvasData = getCanvasJSON();
        const thumbnail = exportCanvas('png', 0.5); // Low quality for thumbnail

        setSaving(true);

        await updateProject(id, {
            name,
            content,
            design,
            canvas_data: canvasData || undefined,
            thumbnail_url: thumbnail || undefined
        });
        setSaving(false);
        toast.success(t('saved'));
    };

    const loadProject = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        const data = await getProject(id);
        if (data) {
            setProject(data);
            setContent(data.content || {});
            setDesign({ ...defaultDesign, ...data.design });
            setName(data.name);
        } else {
            toast.error(t('projectNotFound'));
            router.push('/manage');
        }
        setLoading(false);
    }, [id, getProject, router]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (id && user) loadProject();
    }, [id, user, authLoading, loadProject, router]);

    // Generate QR when canvas is ready or content/design changes
    useEffect(() => {
        if (!canvas || !project) return;

        const generate = async () => {
            try {
                const dataUrl = await generateQRDataURL(
                    project.qr_type as QRType,
                    content,
                    design,
                    project.short_code || undefined
                );

                if (dataUrl) {
                    await updateQRCode(dataUrl);

                    // Update frame if exists
                    if (design.frame.type !== 'none') {
                        updateFrame(design.frame, design.size);
                    } else {
                        updateFrame(design.frame, design.size);
                    }
                }
            } catch (error) {
                console.error('Error generating QR:', error);
                toast.error(t('errorGenerating'));
            }
        };

        // Debounce generation
        const timer = setTimeout(generate, 300);

        return () => clearTimeout(timer);
    }, [canvas, project, content, design, updateQRCode, updateFrame]);



    const handleExport = (format: 'png' | 'jpeg' | 'svg') => {
        if ((format === 'jpeg' || format === 'svg') && !isProUser) {
            handleUpgradeRequired(t('exportFormat', { format: format.toUpperCase() }));
            return;
        }

        const data = exportCanvas(format);
        if (!data) return;

        const link = document.createElement('a');
        if (format === 'svg') {
            const blob = new Blob([data], { type: 'image/svg+xml' });
            link.href = URL.createObjectURL(blob);
        } else {
            link.href = data;
        }
        link.download = `${name || 'qr-code'}.${format}`;
        link.click();
        toast.success(t('downloadedAs', { format: format.toUpperCase() }));
    };

    if (authLoading || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
                <div className="flex h-14 items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/manage')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-[180px] h-9" placeholder={t('projectNamePlaceholder')} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            <span className="ml-1.5 hidden sm:inline">{t('save')}</span>
                        </Button>
                        <Button size="sm" onClick={async () => { await handleSave(); router.push('/manage'); }}>{t('done')}</Button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex">
                {/* Left: Controls */}
                <aside className="w-80 border-r border-border bg-card flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <TabsList className="grid grid-cols-5 m-2">
                            <TabsTrigger value="content"><FileText className="h-4 w-4" /></TabsTrigger>
                            <TabsTrigger value="design"><Palette className="h-4 w-4" /></TabsTrigger>
                            <TabsTrigger value="style"><Sparkles className="h-4 w-4" /></TabsTrigger>
                            <TabsTrigger value="layers"><Layers className="h-4 w-4" /></TabsTrigger>
                            <TabsTrigger value="frame"><Frame className="h-4 w-4" /></TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-auto p-3">
                            <TabsContent value="content" className="mt-0 space-y-3">
                                <ContentForm type={project.qr_type as QRType} content={content} onChange={setContent} />
                            </TabsContent>
                            <TabsContent value="design" className="mt-0 space-y-3">
                                <DesignForm
                                    design={design}
                                    onChange={setDesign}
                                    isProUser={isProUser}
                                    onUpgradeRequired={handleUpgradeRequired}
                                />
                            </TabsContent>
                            <TabsContent value="style" className="mt-0 space-y-3">
                                <StyleForm
                                    design={design}
                                    onChange={setDesign}
                                    isProUser={isProUser}
                                    onUpgradeRequired={handleUpgradeRequired}
                                />
                            </TabsContent>
                            <TabsContent value="layers" className="mt-0 h-full">
                                <LayerPanel
                                    layers={layers}
                                    selectedLayerId={selectedLayerId}
                                    onSelect={selectLayer}
                                    onDelete={deleteLayer}
                                    onToggleVisibility={toggleLayerVisibility}
                                    onToggleLock={toggleLayerLock}
                                    onMoveUp={(id) => moveLayer(id, 'up')}
                                    onMoveDown={(id) => moveLayer(id, 'down')}
                                />
                            </TabsContent>
                            <TabsContent value="frame" className="mt-0 space-y-3">
                                <FrameForm design={design} onChange={setDesign} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </aside>

                {/* Center: Canvas */}
                <main className="flex-1 flex flex-col bg-muted/30">
                    <CanvasToolbar
                        onAddLogo={addLogo}
                        onAddCenterLogo={addCenterLogo}
                        onAddText={() => addText('Your Text')}
                        onAddShape={addShape}
                        onClear={clearCanvas}
                        onExport={handleExport}
                        isProUser={isProUser}
                        onUpgradeRequired={handleUpgradeRequired}
                    />
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="bg-card rounded-xl shadow-soft border border-border p-4">
                            <canvas ref={canvasRef} />
                        </div>

                    </div>
                </main>
            </div>

            <UpgradeModal
                open={upgradeModalOpen}
                onOpenChange={setUpgradeModalOpen}
                title={upgradeModalTitle}
                description={upgradeModalDesc}
            />
        </div>
    );
}

function ContentForm({ type, content, onChange }: { type: QRType; content: QRContent; onChange: (c: QRContent) => void }) {
    const t = useTranslations('Editor');
    if (type === 'url') return <div className="space-y-2"><Label>{t('content.url')}</Label><Input placeholder="https://example.com" value={content.url || ''} onChange={(e) => onChange({ ...content, url: e.target.value })} /></div>;
    if (type === 'text') return <div className="space-y-2"><Label>{t('content.text')}</Label><textarea className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-input bg-background text-sm" value={content.text || ''} onChange={(e) => onChange({ ...content, text: e.target.value })} /></div>;
    if (type === 'wifi') return (
        <div className="space-y-3">
            <div className="space-y-2"><Label>{t('content.networkName')}</Label><Input value={content.wifi?.ssid || ''} onChange={(e) => onChange({ ...content, wifi: { ...content.wifi, ssid: e.target.value, password: content.wifi?.password || '', encryption: content.wifi?.encryption || 'WPA' } })} /></div>
            <div className="space-y-2"><Label>{t('content.password')}</Label><Input type="password" value={content.wifi?.password || ''} onChange={(e) => onChange({ ...content, wifi: { ...content.wifi, ssid: content.wifi?.ssid || '', password: e.target.value, encryption: content.wifi?.encryption || 'WPA' } })} /></div>
        </div>
    );
    if (type === 'vcard') return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><Label className="text-xs">{t('content.firstName')}</Label><Input value={content.vcard?.firstName || ''} onChange={(e) => onChange({ ...content, vcard: { ...content.vcard, firstName: e.target.value, lastName: content.vcard?.lastName || '' } })} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('content.lastName')}</Label><Input value={content.vcard?.lastName || ''} onChange={(e) => onChange({ ...content, vcard: { ...content.vcard, firstName: content.vcard?.firstName || '', lastName: e.target.value } })} /></div>
            </div>
            <div className="space-y-1"><Label className="text-xs">{t('content.phone')}</Label><Input value={content.vcard?.phone || ''} onChange={(e) => onChange({ ...content, vcard: { ...content.vcard, firstName: content.vcard?.firstName || '', lastName: content.vcard?.lastName || '', phone: e.target.value } })} /></div>
            <div className="space-y-1"><Label className="text-xs">{t('content.email')}</Label><Input value={content.vcard?.email || ''} onChange={(e) => onChange({ ...content, vcard: { ...content.vcard, firstName: content.vcard?.firstName || '', lastName: content.vcard?.lastName || '', email: e.target.value } })} /></div>
        </div>
    );
    return null;
}

function DesignForm({
    design,
    onChange,
    isProUser = false,
    onUpgradeRequired
}: {
    design: QRDesign;
    onChange: (d: QRDesign) => void;
    isProUser?: boolean;
    onUpgradeRequired?: (feature: string) => void;
}) {
    const t = useTranslations('Editor');
    const handleGradientChange = (checked: boolean) => {
        if (checked && !isProUser && onUpgradeRequired) {
            onUpgradeRequired(t('gradientColors'));
            return;
        }
        onChange({
            ...design,
            gradient: { ...design.gradient, enabled: checked }
        });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                        {t('design.useGradient')}
                        {!isProUser && <Lock className="h-3 w-3 text-amber-500" />}
                    </Label>
                    <Switch
                        checked={design.gradient.enabled}
                        onCheckedChange={handleGradientChange}
                    />
                </div>
            </div>

            {design.gradient.enabled ? (
                <>
                    <div className="space-y-2">
                        <Label>{t('design.gradientType')}</Label>
                        <Select
                            value={design.gradient.type}
                            onValueChange={(v: 'linear' | 'radial') => onChange({
                                ...design,
                                gradient: { ...design.gradient, type: v }
                            })}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="linear">{t('design.linear')}</SelectItem>
                                <SelectItem value="radial">{t('design.radial')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('design.color1')}</Label>
                        <div className="flex gap-2">
                            <input type="color" value={design.gradient.color1} onChange={(e) => onChange({ ...design, gradient: { ...design.gradient, color1: e.target.value } })} className="w-10 h-10 rounded border cursor-pointer" />
                            <Input value={design.gradient.color1} onChange={(e) => onChange({ ...design, gradient: { ...design.gradient, color1: e.target.value } })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('design.color2')}</Label>
                        <div className="flex gap-2">
                            <input type="color" value={design.gradient.color2} onChange={(e) => onChange({ ...design, gradient: { ...design.gradient, color2: e.target.value } })} className="w-10 h-10 rounded border cursor-pointer" />
                            <Input value={design.gradient.color2} onChange={(e) => onChange({ ...design, gradient: { ...design.gradient, color2: e.target.value } })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('design.rotation')}: {design.gradient.rotation}°</Label>
                        <input type="range" min="0" max="360" value={design.gradient.rotation} onChange={(e) => onChange({ ...design, gradient: { ...design.gradient, rotation: parseInt(e.target.value) } })} className="w-full" />
                    </div>
                </>
            ) : (
                <div className="space-y-2">
                    <Label>{t('design.foregroundColor')}</Label>
                    <div className="flex gap-2">
                        <input type="color" value={design.foregroundColor} onChange={(e) => onChange({ ...design, foregroundColor: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" />
                        <Input value={design.foregroundColor} onChange={(e) => onChange({ ...design, foregroundColor: e.target.value })} />
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <Label>{t('design.backgroundColor')}</Label>
                <div className="flex gap-2">
                    <input type="color" value={design.backgroundColor} onChange={(e) => onChange({ ...design, backgroundColor: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" />
                    <Input value={design.backgroundColor} onChange={(e) => onChange({ ...design, backgroundColor: e.target.value })} />
                </div>
            </div>

            <div className="space-y-2">
                <Label>{t('design.errorCorrection')}</Label>
                <Select value={design.errorCorrection} onValueChange={(v: 'L' | 'M' | 'Q' | 'H') => onChange({ ...design, errorCorrection: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="L">{t('design.low')}</SelectItem>
                        <SelectItem value="M">{t('design.medium')}</SelectItem>
                        <SelectItem value="Q">{t('design.quartile')}</SelectItem>
                        <SelectItem value="H">{t('design.high')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>{t('design.size')}: {design.size}px</Label>
                <input type="range" min="128" max="512" value={design.size} onChange={(e) => onChange({ ...design, size: parseInt(e.target.value) })} className="w-full" />
            </div>
        </div>
    );
}

function StyleForm({
    design,
    onChange,
    isProUser = false,
    onUpgradeRequired
}: {
    design: QRDesign;
    onChange: (d: QRDesign) => void;
    isProUser?: boolean;
    onUpgradeRequired?: (feature: string) => void;
}) {
    const t = useTranslations('Editor');
    const dotStyles: { value: DotStyle; label: string; isPro?: boolean }[] = [
        { value: 'square', label: t('style.square') },
        { value: 'dots', label: t('style.dots'), isPro: true },
        { value: 'rounded', label: t('style.rounded'), isPro: true },
        { value: 'classy', label: t('style.classy'), isPro: true },
        { value: 'classy-rounded', label: t('style.classyRounded'), isPro: true },
    ];

    const cornerStyles: { value: CornerStyle; label: string; isPro?: boolean }[] = [
        { value: 'square', label: t('style.square') },
        { value: 'rounded', label: t('style.rounded'), isPro: true },
        { value: 'circle', label: t('style.circle'), isPro: true },
        { value: 'classy', label: t('style.classy'), isPro: true },
        { value: 'classy-rounded', label: t('style.classyRounded'), isPro: true },
    ];

    const handleStyleChange = (key: keyof QRDesign, value: string, isPro: boolean = false) => {
        if (isPro && !isProUser && onUpgradeRequired) {
            onUpgradeRequired(t('advancedStyling'));
            return;
        }
        onChange({ ...design, [key]: value });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>{t('style.dotStyle')}</Label>
                <Select
                    value={design.dotStyle}
                    onValueChange={(v: DotStyle) => {
                        const style = dotStyles.find(s => s.value === v);
                        handleStyleChange('dotStyle', v, style?.isPro);
                    }}
                >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {dotStyles.map(s => (
                            <SelectItem key={s.value} value={s.value} className="flex items-center justify-between">
                                {s.label}
                                {s.isPro && !isProUser && <Lock className="h-3 w-3 ml-2 text-amber-500 inline" />}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>{t('style.cornerStyle')}</Label>
                <Select
                    value={design.cornerStyle}
                    onValueChange={(v: CornerStyle) => {
                        const style = cornerStyles.find(s => s.value === v);
                        handleStyleChange('cornerStyle', v, style?.isPro);
                    }}
                >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {cornerStyles.map(s => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.label}
                                {s.isPro && !isProUser && <Lock className="h-3 w-3 ml-2 text-amber-500 inline" />}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>{t('style.cornerDotStyle')}</Label>
                <Select
                    value={design.cornerDotStyle}
                    onValueChange={(v: CornerStyle) => {
                        const style = cornerStyles.find(s => s.value === v);
                        handleStyleChange('cornerDotStyle', v, style?.isPro);
                    }}
                >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {cornerStyles.map(s => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.label}
                                {s.isPro && !isProUser && <Lock className="h-3 w-3 ml-2 text-amber-500 inline" />}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-3">{t('style.stylePreview')}</h4>
                <div className="grid grid-cols-3 gap-2">
                    {dotStyles.slice(0, 3).map(style => (
                        <button
                            key={style.value}
                            onClick={() => handleStyleChange('dotStyle', style.value, style.isPro)}
                            className={`p-3 rounded-lg border-2 transition-all relative ${design.dotStyle === style.value ? 'border-secondary bg-secondary/10' : 'border-border hover:border-secondary/50'}`}
                        >
                            <div className="aspect-square bg-foreground rounded-sm" style={{
                                borderRadius: style.value === 'dots' ? '50%' : style.value === 'rounded' ? '4px' : '0'
                            }} />
                            <span className="text-xs mt-1 block">{style.label}</span>
                            {style.isPro && !isProUser && (
                                <div className="absolute top-1 right-1">
                                    <Lock className="h-3 w-3 text-amber-500" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function FrameForm({ design, onChange }: { design: QRDesign; onChange: (d: QRDesign) => void }) {
    const t = useTranslations('Editor');
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>{t('frame.template')}</Label>
                <div className="grid grid-cols-2 gap-2">
                    {frameTemplates.map((frame) => (
                        <button
                            key={frame.id}
                            onClick={() => onChange({ ...design, frame })}
                            className={`p-3 rounded-lg border-2 transition-all text-left ${design.frame.id === frame.id ? 'border-secondary bg-secondary/10' : 'border-border hover:border-secondary/50'}`}
                        >
                            <FramePreview frame={frame} />
                            <span className="text-xs mt-2 block font-medium">{frame.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {design.frame.type === 'label' || design.frame.type === 'banner' ? (
                <>
                    <div className="space-y-2">
                        <Label>{t('frame.labelText')}</Label>
                        <Input
                            value={design.frame.labelText || ''}
                            onChange={(e) => onChange({
                                ...design,
                                frame: { ...design.frame, labelText: e.target.value }
                            })}
                            placeholder={t('frame.scanMe')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('frame.color')}</Label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={design.frame.color || '#1a365d'}
                                onChange={(e) => onChange({
                                    ...design,
                                    frame: { ...design.frame, color: e.target.value }
                                })}
                                className="w-10 h-10 rounded border cursor-pointer"
                            />
                            <Input
                                value={design.frame.color || '#1a365d'}
                                onChange={(e) => onChange({
                                    ...design,
                                    frame: { ...design.frame, color: e.target.value }
                                })}
                            />
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}

function FramePreview({ frame }: { frame: FrameTemplate }) {
    const t = useTranslations('Editor');
    if (frame.type === 'none') {
        return <div className="aspect-square bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">{t('frame.noFrame')}</div>;
    }

    if (frame.type === 'simple') {
        return (
            <div className="aspect-square border-2 border-foreground rounded flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-foreground/20 rounded-sm" />
            </div>
        );
    }

    if (frame.type === 'rounded') {
        return (
            <div className="aspect-square border-2 border-foreground rounded-xl flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-foreground/20 rounded-sm" />
            </div>
        );
    }

    if (frame.type === 'label') {
        return (
            <div className="aspect-square flex flex-col">
                {frame.labelPosition === 'top' && <div className="text-[6px] text-center bg-foreground text-background rounded-t py-0.5">{t('frame.scan')}</div>}
                <div className="flex-1 border-2 border-foreground border-t-0 border-b-0 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 bg-foreground/20 rounded-sm" />
                </div>
                {frame.labelPosition === 'bottom' && <div className="text-[6px] text-center bg-foreground text-background rounded-b py-0.5">{t('frame.scan')}</div>}
            </div>
        );
    }

    if (frame.type === 'banner') {
        return (
            <div className="aspect-square flex flex-col">
                <div className="flex-1 border-2 border-foreground rounded-t flex items-center justify-center">
                    <div className="w-3/4 h-3/4 bg-foreground/20 rounded-sm" />
                </div>
                <div className="text-[5px] text-center bg-foreground text-background rounded-b py-1">{t('frame.scanToVisit')}</div>
            </div>
        );
    }

    return null;
}
