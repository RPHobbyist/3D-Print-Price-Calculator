import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { AGPL_LICENSE_TEXT } from "@/lib/constants";

export const LicenseDialog = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="hover:text-primary transition-colors cursor-pointer bg-transparent border-0 p-0 font-normal whitespace-nowrap">
                    GNU AGPLv3 License
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>GNU AGPLv3 License</DialogTitle>
                </DialogHeader>
                <div className="mt-4 text-sm bg-muted/50 p-4 rounded-md overflow-x-auto overflow-y-auto h-[60vh]">
                    {AGPL_LICENSE_TEXT.split(/\n\n+/).map((paragraph, index) => (
                        <p key={index} className="mb-4 text-justify leading-relaxed last:mb-0">
                            {paragraph.replace(/\n/g, " ")}
                        </p>
                    ))}
                </div>
                <div className="flex justify-end mt-4">
                    <DialogTrigger asChild>
                        <Button variant="outline">I Agree</Button>
                    </DialogTrigger>
                </div>
            </DialogContent>
        </Dialog>
    );
};
