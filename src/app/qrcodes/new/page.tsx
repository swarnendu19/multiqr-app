"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useQRProjects } from '@/hooks/useQRProjects';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { QRType, qrTypeInfo } from '@/types/qr';
import { Link, Type, Wifi, User, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { UpgradeModal } from '@/components/ui/UpgradeModal';

const icons: Record<QRType, React.ComponentType<{ className?: string }>> = {
    url: Link,
    text: Type,
    wifi: Wifi,
    vcard: User,
};

export default function QRTypeSelect() {
    const router = useRouter();
    const { user, loading: authLoading, isProUser } = useAuth();
    const { createProject, projects, loading: projectsLoading } = useQRProjects();
    const [selectedType, setSelectedType] = useState<QRType | null>(null);
    const [creating, setCreating] = useState(false);
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

    useEffect(() => {
        if (!user && !authLoading) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    const handleCreate = async () => {
        if (!isProUser && projects.length >= 5) {
            setUpgradeModalOpen(true);
            return;
        }

        if (!selectedType) {
            toast.error('Please select a QR code type');
            return;
        }

        setCreating(true);
        const projectId = await createProject(selectedType);
        setCreating(false);

        if (projectId) {
            router.push(`/qrcodes/${projectId}/edit?flow=create`);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            Create a New QR Code
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Select the type of QR code you want to create
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mb-8">
                        {(Object.keys(qrTypeInfo) as QRType[]).map((type) => {
                            const info = qrTypeInfo[type];
                            const Icon = icons[type];
                            const isSelected = selectedType === type;

                            return (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`
                    relative p-6 rounded-2xl border-2 text-left transition-all duration-200
                    ${isSelected
                                            ? 'border-secondary bg-secondary/5 shadow-glow'
                                            : 'border-border hover:border-secondary/50 bg-card hover:shadow-soft'
                                        }
                  `}
                                >
                                    <div className={`
                    flex h-12 w-12 items-center justify-center rounded-xl mb-4 transition-colors
                    ${isSelected
                                            ? 'bg-gradient-to-br from-primary to-secondary'
                                            : 'bg-muted'
                                        }
                  `}>
                                        <Icon className={`h-6 w-6 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                    </div>

                                    <h3 className="font-semibold text-lg mb-1">{info.title}</h3>
                                    <p className="text-sm text-muted-foreground">{info.description}</p>

                                    {isSelected && (
                                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                                            <svg className="w-4 h-4 text-secondary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            variant="default"
                            onClick={handleCreate}
                            disabled={!selectedType || creating || projectsLoading}
                            className="min-w-[200px]"
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </main>

            <UpgradeModal
                open={upgradeModalOpen}
                onOpenChange={setUpgradeModalOpen}
                title="Limit Reached"
                description="Free plan includes up to 5 QR codes. Upgrade to Pro for unlimited QR codes."
            />
        </div>
    );
}
