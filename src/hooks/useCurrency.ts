import { useContext } from "react";
import { CurrencyContext } from "@/contexts/CurrencyContext";

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
};
