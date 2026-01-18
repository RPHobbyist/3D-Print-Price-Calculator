import { useState, ReactNode } from "react";
import { Currency, CURRENCIES } from "@/types/currency";
import { CurrencyContext } from "@/contexts/CurrencyContext";

interface CurrencyProviderProps {
    children: ReactNode;
}

const STORAGE_KEY = "preferred-currency";

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
    const [currency, setCurrencyState] = useState<Currency>(() => {
        // Load from localStorage on initial render
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const found = CURRENCIES.find(c => c.code === saved);
                if (found) return found;
            }
        }
        return CURRENCIES[0]; // Default to INR
    });

    const setCurrency = (newCurrency: Currency) => {
        setCurrencyState(newCurrency);
        localStorage.setItem(STORAGE_KEY, newCurrency.code);
    };

    const formatPrice = (amount: number): string => {
        return `${currency.symbol}${amount.toFixed(2)}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
};
