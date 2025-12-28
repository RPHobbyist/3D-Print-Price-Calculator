import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Lightbulb, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RECIPIENT_EMAIL = "rpelectrical06@gmail.com";

export const FeatureSuggestion = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [suggestion, setSuggestion] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Create mailto link with suggestion details
        const subject = encodeURIComponent("3D Print Price Calculator - Feature Suggestion");
        const body = encodeURIComponent(
            `Feature Suggestion for 3D Print Price Calculator\n\n` +
            `From: ${name || "Anonymous"}\n` +
            `Email: ${email || "Not provided"}\n\n` +
            `Suggestion:\n${suggestion}\n\n` +
            `---\nSent from 3D Print Price Calculator`
        );

        // Open mailto link
        window.open(`mailto:${RECIPIENT_EMAIL}?subject=${subject}&body=${body}`, "_blank");

        toast({
            title: "Email client opened!",
            description: "Please send the email to submit your suggestion.",
        });

        // Reset form
        setName("");
        setEmail("");
        setSuggestion("");
        setOpen(false);
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Submit Suggestion
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-white text-xl">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Lightbulb className="w-5 h-5" />
                            </div>
                            Submit a Suggestion
                        </DialogTitle>
                        <DialogDescription className="text-white/80 mt-2">
                            Have an idea to improve this tool? We'd love to hear from you!
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                            Name <span className="text-muted-foreground text-xs">(optional)</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-11 transition-all focus:ring-2 focus:ring-purple-500/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email <span className="text-muted-foreground text-xs">(optional)</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11 transition-all focus:ring-2 focus:ring-purple-500/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="suggestion" className="text-sm font-medium">
                            Your Suggestion <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="suggestion"
                            placeholder="Describe your feature idea..."
                            value={suggestion}
                            onChange={(e) => setSuggestion(e.target.value)}
                            required
                            rows={4}
                            className="resize-none transition-all focus:ring-2 focus:ring-purple-500/20"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
                        disabled={loading || !suggestion.trim()}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Opening email...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Submit via Email
                            </>
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default FeatureSuggestion;
