import { useCurrency } from "@/hooks/useCurrency";
import { CURRENCIES, Currency } from "@/types/currency";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export const CurrencySelector = () => {
    const { currency, setCurrency } = useCurrency();

    const handleChange = (code: string) => {
        const selected = CURRENCIES.find(c => c.code === code);
        if (selected) {
            setCurrency(selected);
        }
    };

    return (
        <Select value={currency.code} onValueChange={handleChange}>
            <SelectTrigger className="w-[100px] h-8 px-2">
                <SelectValue>
                    <span className="flex items-center gap-2">
                        <span className="font-medium">{currency.symbol}</span>
                        <span>{currency.code}</span>
                    </span>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                        <span className="flex items-center gap-2">
                            <span className="font-medium w-5">{c.symbol}</span>
                            <span>{c.code}</span>
                            <span className="text-muted-foreground text-xs">- {c.name}</span>
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default CurrencySelector;
