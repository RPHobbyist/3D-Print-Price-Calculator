import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Currency {
    code: string;
    symbol: string;
    name: string;
}

export const CURRENCIES: Currency[] = [
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
];

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatPrice: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
};

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
