import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

interface UpgradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
}

export function UpgradeModal({
    open,
    onOpenChange,
    title,
    description,
}: UpgradeModalProps) {
    const t = useTranslations('UpgradeModal');
    const router = useRouter();

    const displayTitle = title || t('title');
    const displayDesc = description || t('description');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        {displayTitle}
                    </DialogTitle>
                    <DialogDescription>{displayDesc}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-primary">✓</span> {t('feature1')}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-primary">✓</span> {t('feature2')}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-primary">✓</span> {t('feature3')}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-primary">✓</span> {t('feature4')}
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={() => {
                            onOpenChange(false);
                            router.push("/pricing");
                        }}
                        className="w-full sm:w-auto"
                    >
                        {t('upgradeButton')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
