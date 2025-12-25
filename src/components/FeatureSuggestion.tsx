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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        Submit a Suggestion
                    </DialogTitle>
                    <DialogDescription>
                        Have an idea to improve this tool? We'd love to hear from you!
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name (optional)</Label>
                        <Input
                            id="name"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email (optional)</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="suggestion">Your Suggestion *</Label>
                        <Textarea
                            id="suggestion"
                            placeholder="Describe your feature idea..."
                            value={suggestion}
                            onChange={(e) => setSuggestion(e.target.value)}
                            required
                            rows={4}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading || !suggestion.trim()}>
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
