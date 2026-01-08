import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Package, CalendarDays, Building2, Paintbrush, ArrowRight } from "lucide-react";

const CURRENT_VERSION = "1.2.0"; // Bumped version for new features
const STORAGE_KEY = "last_seen_version";

export const WhatsNewDialog = ({ trigger }: { trigger?: React.ReactNode }) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const lastSeen = localStorage.getItem(STORAGE_KEY);
        if (lastSeen !== CURRENT_VERSION) {
            // Small delay to appear after app load
            const timer = setTimeout(() => setOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) handleClose();
        }}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-2xl bg-card border-border p-0 overflow-hidden gap-0">
                {/* Header Banner */}
                <div className="bg-primary p-6 text-primary-foreground relative overflow-hidden">

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/20">

                            <span>New Update {CURRENT_VERSION}</span>
                        </div>
                        <DialogTitle className="text-3xl font-bold tracking-tight">What's New</DialogTitle>
                        <DialogDescription className="text-primary-foreground/90 mt-2 text-base">
                            We've been busy! Check out the latest tools to power up your printing business.
                        </DialogDescription>
                    </div>
                </div>

                {/* Features List */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">

                    <FeatureItem
                        icon={<Package className="w-6 h-6 text-blue-500" />}
                        title="Inventory Management"
                        description="Track your filament spools and resin bottles. The calculator now automatically checks stock levels and deducts usage from specific items."
                    />

                    <FeatureItem
                        icon={<CalendarDays className="w-6 h-6 text-purple-500" />}
                        title="Capacity Planner"
                        description="Plan big projects with ease. Select your printers and see exactly how long a job will take and when it will be finished."
                    />

                    <FeatureItem
                        icon={<Building2 className="w-6 h-6 text-emerald-500" />}
                        title="Company Settings"
                        description="Personalize your brand. Add your company info, logo, and custom footer text to all generated PDF quotes and invoices."
                    />

                    <FeatureItem
                        icon={<Paintbrush className="w-6 h-6 text-pink-500" />}
                        title="Enhanced Experience"
                        description="Enjoy a smoother experience with visual color swatches, improved quote layouts, and smarter printer matching."
                    />

                </div>

                {/* Footer */}
                <DialogFooter className="p-6 pt-2 bg-muted/20 border-t border-border">
                    <Button onClick={handleClose} className="w-full sm:w-auto gap-2 text-base px-8 h-12 shadow-lg hover:shadow-xl transition-all">
                        Let's Explore
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex gap-4 items-start p-2 rounded-xl hover:bg-muted/50 transition-colors">
        <div className="shrink-0 p-3 bg-background rounded-full border border-border mt-1 shadow-sm">
            {icon}
        </div>
        <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-none pt-2">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">
                {description}
            </p>
        </div>
    </div>
);

export default WhatsNewDialog;
