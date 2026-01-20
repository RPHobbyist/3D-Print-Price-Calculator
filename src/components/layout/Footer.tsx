/*
 * 3D Print Price Calculator
 * Copyright (C) 2025 Rp Hobbyist
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Youtube } from "lucide-react";
import { FeatureSuggestion } from "@/components/feedback/FeatureSuggestion";
import { Link } from "react-router-dom";
import { lazy, Suspense } from "react";
import { SYSTEM_CONFIG } from "@/lib/core/core-system";

// Lazy load the license dialog to reduce initial bundle size
const LicenseDialog = lazy(() => import("@/components/feedback/LicenseDialog").then(m => ({ default: m.LicenseDialog })));

// GitHub icon component (lucide-react doesn't have GitHub icon)
const GithubIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4"
    >
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

export const Footer = () => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm px-6 py-2 flex items-center justify-between text-xs text-muted-foreground">
            {/* Left: Links and credits */}
            <div className="flex flex-wrap items-center gap-4">
                <span>Made by <a href={SYSTEM_CONFIG.vendorLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline-offset-2 hover:underline">{SYSTEM_CONFIG.vendor}</a></span>

                <Suspense fallback={<span className="text-muted-foreground/60">GNU AGPLv3 License</span>}>
                    <LicenseDialog />
                </Suspense>

                <a
                    href={SYSTEM_CONFIG.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors whitespace-nowrap"
                >
                    <GithubIcon />
                    GitHub
                </a>

                <a
                    href={SYSTEM_CONFIG.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-red-500 transition-colors whitespace-nowrap"
                >
                    <Youtube className="w-4 h-4" />
                    Tutorial
                </a>

                <FeatureSuggestion />
                <Link to="/print-management" className="hover:text-primary transition-colors hover:underline">
                    Print Management
                </Link>
            </div>

            {/* Right: Privacy notice */}
            <div className="flex items-center gap-2 text-muted-foreground/80 whitespace-nowrap hidden sm:flex">
                <span>🔒</span>
                <span>Your privacy matters — No user data is collected or stored on external servers</span>
            </div>
            <div className="sm:hidden text-center w-full mt-2 text-[10px] text-muted-foreground/60">
                🔒 Privacy: Local storage only
            </div>
        </footer>
    );
};

export default Footer;

