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

export const Footer = () => {
    return (
        <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-auto">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 order-2 md:order-1">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-purple-600 fill-purple-600 animate-pulse" />
                        <span>by Rp Hobbyist</span>
                    </div>

                    <div className="flex items-center gap-6 order-1 md:order-2">
                        <a
                            href="https://opensource.org/licenses/MIT"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 hover:text-primary transition-colors group"
                        >
                            <span className="border-b border-transparent group-hover:border-primary/50 transition-colors">MIT Open Source License</span>
                        </a>

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
                </div>

                {/* Privacy Notice */}
                <div className="text-center text-xs text-muted-foreground/70 mt-4 pt-4 border-t border-border/50">
                    <span>🔒 Your privacy matters — No user data is collected or stored on external servers. All data stays in your browser.</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
