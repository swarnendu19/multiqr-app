"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { qrTemplates, QRTemplate, QRType, defaultDesign } from '@/types/qr';
import { useQRProjects } from '@/hooks/useQRProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Briefcase, Users, Megaphone, Calendar, Heart, Loader2 } from 'lucide-react';
import { generateQRDataURL } from '@/lib/qr-generator';
import { toast } from 'sonner';

const categoryIcons = {
    business: Briefcase,
    social: Users,
    marketing: Megaphone,
    events: Calendar,
    personal: Heart,
};

const categoryLabels = {
    business: 'Business',
    social: 'Social Media',
    marketing: 'Marketing',
    events: 'Events',
    personal: 'Personal',
};

export default function Templates() {
    const router = useRouter();
    const { createProject, updateProject } = useQRProjects();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [templatePreviews, setTemplatePreviews] = useState<Record<string, string>>({});
    const [selectedTemplate, setSelectedTemplate] = useState<QRTemplate | null>(null);
    const [qrType, setQRType] = useState<QRType>('url');
    const [creating, setCreating] = useState(false);

    // Generate preview images for all templates
    useEffect(() => {
        const generatePreviews = async () => {
            const previews: Record<string, string> = {};
            for (const template of qrTemplates) {
                const preview = await generateQRDataURL('url', { url: 'https://example.com' }, template.design);
                previews[template.id] = preview;
            }
            setTemplatePreviews(previews);
        };
        generatePreviews();
    }, []);

    const filteredTemplates = qrTemplates.filter((template) => {
        const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
            template.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleUseTemplate = async () => {
        if (!selectedTemplate) return;

        setCreating(true);
        try {
            const projectId = await createProject(qrType, `${selectedTemplate.name} QR`);
            if (projectId) {
                // Update the project with the template design
                await updateProject(projectId, {
                    design: selectedTemplate.design,
                });
                toast.success('QR code created from template!');
                router.push(`/qrcodes/${projectId}/edit`);
            }
        } catch (error) {
            toast.error('Failed to create QR code');
        } finally {
            setCreating(false);
            setSelectedTemplate(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Templates</h1>
                    <p className="text-muted-foreground">
                        Start with a professionally designed template
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search templates..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="social">Social Media</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="events">Events</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Category Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {Object.entries(categoryLabels).map(([key, label]) => {
                        const Icon = categoryIcons[key as keyof typeof categoryIcons];
                        const count = qrTemplates.filter(t => t.category === key).length;
                        return (
                            <Badge
                                key={key}
                                variant={selectedCategory === key ? 'default' : 'secondary'}
                                className="cursor-pointer px-3 py-1.5 text-sm"
                                onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key)}
                            >
                                <Icon className="h-3.5 w-3.5 mr-1.5" />
                                {label} ({count})
                            </Badge>
                        );
                    })}
                </div>

                {/* Templates Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTemplates.map((template) => {
                        const CategoryIcon = categoryIcons[template.category];
                        return (
                            <div
                                key={template.id}
                                className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-soft transition-all cursor-pointer"
                                onClick={() => setSelectedTemplate(template)}
                            >
                                {/* Preview */}
                                <div
                                    className="aspect-square p-6 flex items-center justify-center"
                                    style={{ backgroundColor: template.design.backgroundColor }}
                                >
                                    {templatePreviews[template.id] ? (
                                        <img
                                            src={templatePreviews[template.id]}
                                            alt={template.name}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4 border-t border-border">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-medium">{template.name}</h3>
                                        <Badge variant="outline" className="text-xs">
                                            <CategoryIcon className="h-3 w-3 mr-1" />
                                            {categoryLabels[template.category]}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {template.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredTemplates.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground">No templates found matching your criteria</p>
                    </div>
                )}
            </div>

            {/* Template Selection Dialog */}
            <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Use Template: {selectedTemplate?.name}</DialogTitle>
                        <DialogDescription>
                            {selectedTemplate?.description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {/* Template Preview */}
                        <div
                            className="aspect-square max-w-[200px] mx-auto p-4 rounded-lg mb-6"
                            style={{ backgroundColor: selectedTemplate?.design.backgroundColor }}
                        >
                            {selectedTemplate && templatePreviews[selectedTemplate.id] && (
                                <img
                                    src={templatePreviews[selectedTemplate.id]}
                                    alt={selectedTemplate.name}
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>

                        {/* QR Type Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">What type of QR code do you want to create?</label>
                            <Select value={qrType} onValueChange={(v) => setQRType(v as QRType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="url">URL / Website</SelectItem>
                                    <SelectItem value="text">Plain Text</SelectItem>
                                    <SelectItem value="wifi">WiFi Network</SelectItem>
                                    <SelectItem value="vcard">Contact Card (vCard)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setSelectedTemplate(null)}>
                            Cancel
                        </Button>
                        <Button className="flex-1" onClick={handleUseTemplate} disabled={creating}>
                            {creating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create QR Code'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
