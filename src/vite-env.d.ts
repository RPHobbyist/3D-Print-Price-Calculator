/// <reference types="vite/client" />

interface BambuDevice {
    dev_id: string;
    name: string;
    model: string;
    dev_access_code?: string;
    access_code?: string;
    user_id?: string;
    online?: boolean;
    print_status?: string;
}

interface PrinterConnection {
    ip: string;
    serial: string;
    status: string;
    cloudMode?: boolean;
}

interface PrintOptions {
    [key: string]: string | number | boolean | undefined;
    plate?: number;
    use_ams?: boolean;
    timelapse?: boolean;
    bed_levelling?: boolean;
    flow_cali?: boolean;
    vibration_cali?: boolean;
    layer_inspect?: boolean;
}

interface ElectronAPI {
    platform: string;
    versions: {
        node: string;
        chrome: string;
        electron: string;
    };
    printer: {
        connect: (config: { ip?: string; accessCode: string; serial: string; cloudMode?: boolean }) => Promise<PrinterConnection>;
        disconnect: (ip: string) => Promise<boolean>;
        sendFile: (config: { ip: string; filePath: string }) => Promise<{ success: boolean; message: string }>;
        startPrint: (config: { ip: string; fileName: string; options?: PrintOptions }) => Promise<{ success: boolean }>;
        onStatus: (callback: (data: { ip: string; status: string; error?: string }) => void) => () => void;
        onData: (callback: (data: { ip: string; topic: string; payload: unknown }) => void) => () => void;
        onStatusUpdate: (callback: (data: { ip: string; state: string; progress: number; remainingTime: number }) => void) => () => void;
        getConnectedPrinters: () => Promise<PrinterConnection[]>;
    };
    bambu: {
        login: (creds: { email: string; password: string; code?: string }) => Promise<boolean>;
        getDevices: () => Promise<BambuDevice[]>;
    };
}

interface Window {
    electronAPI: ElectronAPI;
}
