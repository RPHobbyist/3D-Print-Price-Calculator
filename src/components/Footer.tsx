import { Heart } from "lucide-react";
import { FeatureSuggestion } from "./FeatureSuggestion";

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

// GitHub repository URL
const GITHUB_URL = "https://github.com/RPHobbyist/3D-Print-Price-Calculator";

const MIT_LICENSE_TEXT = `MIT License

Copyright (c) 2025 Rp Hobbyist

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Footer = () => {
    return (
        <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-auto">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col gap-4 text-sm text-muted-foreground">
                    {/* Top row: Links and credits */}
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-6">
                        <div className="flex items-center gap-2">
                            <span>Made with</span>
                            <Heart className="w-4 h-4 text-purple-600 fill-purple-600 animate-pulse" />
                            <span>by <a href="https://linktr.ee/RPHobbyist" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline-offset-2 hover:underline">Rp Hobbyist</a></span>
                        </div>

                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="flex items-center gap-1.5 hover:text-primary transition-colors group cursor-pointer bg-transparent border-0 p-0 text-sm font-normal">
                                    <span className="border-b border-transparent group-hover:border-primary/50 transition-colors">MIT License</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>MIT License</DialogTitle>
                                </DialogHeader>
                                <div className="mt-4 whitespace-pre-wrap font-mono text-sm bg-muted/50 p-4 rounded-md overflow-x-auto">
                                    {MIT_LICENSE_TEXT}
                                </div>
                                <div className="flex justify-end mt-4">
                                    <DialogTrigger asChild>
                                        <Button variant="outline">Close</Button>
                                    </DialogTrigger>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <a
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 hover:text-primary transition-colors group"
                        >
                            <GithubIcon />
                            <span className="border-b border-transparent group-hover:border-primary/50 transition-colors">GitHub</span>
                        </a>

                        <FeatureSuggestion />
                    </div>

                    {/* Privacy notice - centered below */}
                    <div className="text-xs text-muted-foreground/80 text-center">
                        🔒 Your privacy matters — No data collected or stored externally
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
