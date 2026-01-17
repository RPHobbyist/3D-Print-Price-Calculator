import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

export const LicenseDialog = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="hover:text-primary transition-colors cursor-pointer bg-transparent border-0 p-0 font-normal whitespace-nowrap">
                    MIT Open Source License
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
    );
};
