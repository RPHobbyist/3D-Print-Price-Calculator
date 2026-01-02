import { useEffect } from 'react';

export const useAppProtection = () => {
    useEffect(() => {
        // Disable right-click context menu
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        // Disable keyboard shortcuts for developer tools and inspection
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent F12
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }

            // Prevent Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect)
            if (
                e.ctrlKey &&
                e.shiftKey &&
                (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key === 'i' || e.key === 'j' || e.key === 'c')
            ) {
                e.preventDefault();
                return false;
            }

            // Prevent Ctrl+U (View Source)
            if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
                e.preventDefault();
                return false;
            }
        };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
};
