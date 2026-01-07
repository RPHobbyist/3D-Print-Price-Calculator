import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Customer } from "@/types/quote";
import { getCustomerStats } from "@/lib/sessionStorage";
import { useCurrency } from "@/components/CurrencyProvider";
import { Building2, MapPin, Calendar, Receipt, TrendingUp, Mail, Phone, Clock, Users } from "lucide-react";
import { useMemo } from "react";

interface CustomerDetailsDialogProps {
    customer: Customer | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsDialog = ({ customer, open, onOpenChange }: CustomerDetailsDialogProps) => {
    const { formatPrice } = useCurrency();

    const stats = useMemo(() => {
        if (!customer) return null;
        return getCustomerStats(customer.id);
    }, [customer, open]); // Recalculate when opening

    if (!customer || !stats) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border sm:max-w-[700px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <div className="bg-gradient-primary px-6 py-6 text-primary-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center justify-between">
                            <span>{customer.name}</span>
                            {customer.tags && customer.tags.length > 0 && (
                                <div className="flex gap-2">
                                    {customer.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-primary-foreground/80 flex items-center gap-4 mt-2">
                            {customer.company && (
                                <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {customer.company}</span>
                            )}
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Member since {new Date(customer.createdAt).toLocaleDateString()}</span>
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-y-auto w-full">
                    <div className="p-6 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Card className="p-4 bg-muted/30 border-dashed border-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Receipt className="w-5 h-5" /></div>
                                    <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.orderCount}</p>
                            </Card>
                            <Card className="p-4 bg-muted/30 border-dashed border-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-success/10 rounded-lg text-success"><TrendingUp className="w-5 h-5" /></div>
                                    <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
                                </div>
                                <p className="text-2xl font-bold">{formatPrice(stats.totalSpent)}</p>
                            </Card>
                            <Card className="p-4 bg-muted/30 border-dashed border-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-accent/10 rounded-lg text-accent"><Calendar className="w-5 h-5" /></div>
                                    <span className="text-sm font-medium text-muted-foreground">Last Order</span>
                                </div>
                                <p className="text-lg font-semibold truncate" title={stats.lastOrderDate ? new Date(stats.lastOrderDate).toLocaleDateString() : "Never"}>
                                    {stats.lastOrderDate ? new Date(stats.lastOrderDate).toLocaleDateString() : "-"}
                                </p>
                            </Card>
                        </div>

                        <div className="grid md:grid-cols-[1fr_300px] gap-6">
                            {/* Order History */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-primary" /> Order History
                                </h3>
                                <Card className="border border-border shadow-sm overflow-hidden">
                                    <ScrollArea className="h-[300px]">
                                        {stats.quotes.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full py-10 text-muted-foreground">
                                                <Receipt className="w-10 h-10 mb-2 opacity-20" />
                                                <p>No orders yet</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-border">
                                                {stats.quotes.map((quote, i) => (
                                                    <div key={quote.id || i} className="p-4 hover:bg-muted/50 transition-colors flex justify-between items-center bg-card">
                                                        <div>
                                                            <p className="font-medium text-foreground">{quote.projectName}</p>
                                                            <p className="text-xs text-muted-foreground">{new Date(quote.createdAt || "").toLocaleDateString()} • {quote.printType}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-primary">{formatPrice(quote.totalPrice)}</p>
                                                            <span className="text-xs text-muted-foreground">{quote.quantity} units</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </Card>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <div className="p-1 rounded bg-secondary"><Users className="w-4 h-4" /></div> Contact Info
                                </h3>
                                <Card className="p-4 space-y-4 bg-muted/10 h-fit">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</p>
                                        <div className="flex items-center gap-2 text-sm break-all">
                                            <Mail className="w-4 h-4 text-primary shrink-0" />
                                            {customer.email ? <a href={`mailto:${customer.email}`} className="hover:underline">{customer.email}</a> : "-"}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</p>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="w-4 h-4 text-primary shrink-0" />
                                            {customer.phone ? <a href={`tel:${customer.phone}`} className="hover:underline">{customer.phone}</a> : "-"}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</p>
                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                            <span className="whitespace-pre-line">{customer.address || "-"}</span>
                                        </div>
                                    </div>
                                    {customer.notes && (
                                        <div className="space-y-1 pt-2 border-t border-dashed">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Internal Notes</p>
                                            <p className="text-sm text-muted-foreground italic bg-muted/50 p-2 rounded">{customer.notes}</p>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
