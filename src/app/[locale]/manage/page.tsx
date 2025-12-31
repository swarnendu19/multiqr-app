"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQRProjects } from '@/hooks/useQRProjects';
import { QRProject, QRType } from '@/types/qr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Download,
    Copy,
    Trash2,
    QrCode,
    Loader2,
    Link,
    Type,
    Wifi,
    User,
} from 'lucide-react';
import { generateQRDataURL } from '@/lib/qr-generator';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { UpgradeModal } from '@/components/ui/UpgradeModal';

const typeIcons: Record<QRType, React.ComponentType<{ className?: string }>> = {
    url: Link,
    text: Type,
    wifi: Wifi,
    vcard: User,
};

import { useAuth } from '@/lib/auth';
import { API_URL } from '@/lib/config';
import { useTranslations } from 'next-intl';

function ManageContent() {
    const t = useTranslations('Manage');
    const router = useRouter();
    const { user, updateUser, isProUser } = useAuth();
    const searchParams = useSearchParams();
    const { projects, loading, deleteProject, duplicateProject } = useQRProjects();
    const [search, setSearch] = useState('');
    const [downloadModal, setDownloadModal] = useState<QRProject | null>(null);
    const [downloadUrl, setDownloadUrl] = useState('');
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [upgradeModalTitle, setUpgradeModalTitle] = useState(t('upgradeTitle'));
    const [upgradeModalDesc, setUpgradeModalDesc] = useState(t('upgradeDesc'));

    // Check subscription status if returning from Stripe
    useEffect(() => {
        const checkSubscription = async () => {
            if (!user) return;

            if (searchParams.get('session_id')) {
                try {
                    const response = await fetch(`${API_URL}/api/check-subscription`, {
                        headers: { 'user-id': user.id }
                    });
                    const { status } = await response.json();
                    updateUser({ subscription_status: status });

                    toast.success(t('subUpdated'));
                    // Clear query params
                    router.replace('/manage');
                } catch (error) {
                    console.error('Failed to sync subscription', error);
                }
            }
        };

        if (user) checkSubscription();
    }, [user, searchParams, router]);

    // Check for download param from redirect
    useEffect(() => {
        const downloadId = searchParams.get('download');
        if (downloadId && projects.length > 0) {
            const project = projects.find((p) => p.id === downloadId);
            if (project) {
                openDownloadModal(project);
                const params = new URLSearchParams(searchParams.toString());
                params.delete('download');
                router.replace(`/manage?${params.toString()}`);
            }
        }
    }, [searchParams, projects, router]);

    const openDownloadModal = async (project: QRProject) => {
        setDownloadModal(project);
        if (project.thumbnail_url) {
            setDownloadUrl(project.thumbnail_url);
        } else {
            const dataUrl = await generateQRDataURL(
                project.qr_type as QRType,
                project.content,
                project.design,
                project.short_code || undefined
            );
            setDownloadUrl(dataUrl);
        }
    };

    const handleCreateNew = () => {
        if (!isProUser && projects.length >= 5) {
            setUpgradeModalTitle(t('limitTitle'));
            setUpgradeModalDesc(t('limitDesc'));
            setUpgradeModalOpen(true);
            return;
        }
        router.push('/qrcodes/new');
    };

    const handleDownload = async (format: 'png' | 'jpeg' | 'svg') => {
        if (!downloadModal || !downloadUrl) return;

        if ((format === 'jpeg' || format === 'svg') && !isProUser) {
            setUpgradeModalTitle(t('proFeatureTitle'));
            setUpgradeModalDesc(t('proFeatureDesc'));
            setUpgradeModalOpen(true);
            return;
        }

        if (format === 'svg') {
            toast.info(t('svgInfo'));
            router.push(`/qrcodes/${downloadModal.id}/edit`);
            return;
        }

        if (format === 'png') {
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${downloadModal.name}.png`;
            a.click();
            toast.success(t('downloadPng'));
            return;
        }

        if (format === 'jpeg') {
            // Convert PNG data URL to JPEG using a temporary canvas
            const img = new Image();
            img.src = downloadUrl;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#FFFFFF'; // JPEG needs background
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    const jpegUrl = canvas.toDataURL('image/jpeg', 0.9);
                    const a = document.createElement('a');
                    a.href = jpegUrl;
                    a.download = `${downloadModal.name}.jpeg`;
                    a.click();
                    toast.success(t('downloadJpeg'));
                }
            };
        }
    };

    const handleDelete = async (project: QRProject) => {
        if (confirm(t('deleteConfirm', { name: project.name }))) {
            await deleteProject(project.id);
        }
    };

    const handleDuplicate = (project: QRProject) => {
        if (!isProUser && projects.length >= 5) {
            setUpgradeModalTitle(t('limitTitle'));
            setUpgradeModalDesc(t('limitDesc'));
            setUpgradeModalOpen(true);
            return;
        }
        duplicateProject(project);
    };

    const filteredProjects = projects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>
                <Button onClick={handleCreateNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('createNew')}
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t('searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Projects Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-16">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <QrCode className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">{t('noQrCodes')}</h3>
                    <p className="text-muted-foreground mb-6">
                        {t('createFirst')}
                    </p>
                    <Button onClick={handleCreateNew}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('createQr')}
                    </Button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onEdit={() => router.push(`/qrcodes/${project.id}/edit`)}
                            onDownload={() => openDownloadModal(project)}
                            onDuplicate={() => handleDuplicate(project)}
                            onDelete={() => handleDelete(project)}
                        />
                    ))}
                </div>
            )}

            {/* Download Modal */}
            <Dialog open={!!downloadModal} onOpenChange={() => setDownloadModal(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('readyTitle')}</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center py-4">
                        {downloadUrl ? (
                            <img
                                src={downloadUrl}
                                alt="QR Code"
                                className="w-48 h-48 rounded-lg shadow-soft mb-4"
                            />
                        ) : (
                            <div className="w-48 h-48 rounded-lg bg-muted flex items-center justify-center mb-4">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}

                        <p className="text-center text-muted-foreground text-sm mb-4">
                            {t('readyDesc')}
                        </p>

                        <div className="flex gap-2 w-full">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleDownload('png')}
                                disabled={!downloadUrl}
                            >
                                <Download className="h-4 w-4 mr-1" />
                                {t('png')}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleDownload('jpeg')}
                                disabled={!downloadUrl}
                            >
                                <Download className="h-4 w-4 mr-1" />
                                {t('jpeg')}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleDownload('svg')}
                                disabled={!downloadUrl}
                            >
                                <Download className="h-4 w-4 mr-1" />
                                {t('svg')}
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            className="mt-4"
                            onClick={() => {
                                setDownloadModal(null);
                                if (downloadModal) {
                                    router.push(`/qrcodes/${downloadModal.id}/edit`);
                                }
                            }}
                        >

                            {t('goToEditor')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <UpgradeModal
                open={upgradeModalOpen}
                onOpenChange={setUpgradeModalOpen}
                title={upgradeModalTitle}
                description={upgradeModalDesc}
            />
        </div>
    );
}

export default function Manage() {
    return (
        <DashboardLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                <ManageContent />
            </Suspense>
        </DashboardLayout>
    );
}

// Project Card Component
function ProjectCard({
    project,
    onEdit,
    onDownload,
    onDuplicate,
    onDelete,
}: {
    project: QRProject;
    onEdit: () => void;
    onDownload: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
}) {
    const [previewUrl, setPreviewUrl] = useState('');
    const t = useTranslations('Manage');
    const TypeIcon = typeIcons[project.qr_type as QRType] || QrCode;

    useEffect(() => {
        if (project.thumbnail_url) {
            setPreviewUrl(project.thumbnail_url);
        } else {
            generateQRDataURL(project.qr_type as QRType, project.content, project.design, project.short_code || undefined).then(
                setPreviewUrl
            );
        }
    }, [project]);

    return (
        <div className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-soft transition-all">
            {/* Preview */}
            <div
                className="aspect-square p-4 bg-muted/30 flex items-center justify-center cursor-pointer"
                onClick={onEdit}
            >
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt={project.name}
                        className="w-full h-full object-contain rounded-lg"
                    />
                ) : (
                    <QrCode className="h-16 w-16 text-muted-foreground/50" />
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h3 className="font-medium truncate">{project.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <TypeIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground uppercase">
                                {project.qr_type}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(project.updated_at), 'MMM d, yyyy')}
                        </p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>
                                <Edit className="h-4 w-4 mr-2" />
                                {t('edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onDownload}>
                                <Download className="h-4 w-4 mr-2" />
                                {t('download')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onDuplicate}>
                                <Copy className="h-4 w-4 mr-2" />
                                {t('duplicate')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
