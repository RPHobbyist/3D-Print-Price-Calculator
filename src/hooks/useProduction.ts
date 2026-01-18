import { useContext } from "react";
import { ProductionContext } from "@/contexts/ProductionContext";

export const useProduction = () => {
    const context = useContext(ProductionContext);
    if (!context) {
        throw new Error('useProduction must be used within a ProductionProvider');
    }
    return context;
};
