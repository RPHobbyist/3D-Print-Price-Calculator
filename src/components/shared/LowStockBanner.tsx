import { useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Package } from "lucide-react";
import { getLowStockMaterials } from "@/lib/sessionStorage";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface LowStockBannerProps {
    threshold?: number;
    className?: string;
}

export function LowStockBanner({ threshold = 200, className }: LowStockBannerProps) {
    const lowStockMaterials = useMemo(() => {
        return getLowStockMaterials(threshold);
    }, [threshold]);

    if (lowStockMaterials.length === 0) return null;

    return (
        <Alert variant="destructive" className={`bg-destructive/10 border-destructive/30 ${className}`}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between w-full">
                <span>
                    <strong>{lowStockMaterials.length}</strong> material{lowStockMaterials.length > 1 ? 's' : ''} running low:
                    {' '}{lowStockMaterials.slice(0, 3).map(m => m.name).join(', ')}
                    {lowStockMaterials.length > 3 && ` +${lowStockMaterials.length - 3} more`}
                </span>
                <Button variant="outline" size="sm" asChild className="ml-4 shrink-0">
                    <Link to="/settings">
                        <Package className="w-4 h-4 mr-2" />
                        Manage Stock
                    </Link>
                </Button>
            </AlertDescription>
        </Alert>
    );
}
