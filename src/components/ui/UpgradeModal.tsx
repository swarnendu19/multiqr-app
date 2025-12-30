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

interface UpgradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
}

export function UpgradeModal({
    open,
    onOpenChange,
    title = "Upgrade to Pro",
    description = "This feature is available exclusively to Pro plan subscribers. Upgrade now to unlock unlimited potential.",
}: UpgradeModalProps) {
    const router = useRouter();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-primary">✓</span> Unlimited QR Codes
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-primary">✓</span> Advanced Styling & Logos
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-primary">✓</span> SVG & JPEG Exports
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-primary">✓</span> Scan Analytics
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            onOpenChange(false);
                            router.push("/pricing");
                        }}
                        className="w-full sm:w-auto"
                    >
                        Upgrade to Pro
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
