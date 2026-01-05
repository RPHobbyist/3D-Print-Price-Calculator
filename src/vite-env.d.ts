/// <reference types="vite/client" />

interface ElectronAPI {
    platform: string;
    versions: {
        node: string;
        chrome: string;
        electron: string;
    };
    printer: {
        connect: (config: { ip?: string; accessCode: string; serial: string; cloudMode?: boolean }) => Promise<any>;
        disconnect: (ip: string) => Promise<boolean>;
        sendFile: (config: { ip: string; filePath: string }) => Promise<{ success: boolean; message: string }>;
        startPrint: (config: { ip: string; fileName: string; options?: any }) => Promise<{ success: boolean }>;
        onStatus: (callback: (data: { ip: string; status: string; error?: string }) => void) => () => void;
        onData: (callback: (data: { ip: string; topic: string; payload: any }) => void) => () => void;
        onStatusUpdate: (callback: (data: { ip: string; state: string; progress: number; remainingTime: number }) => void) => () => void;
        getConnectedPrinters: () => Promise<Array<{ ip: string; serial: string; status: string; cloudMode?: boolean }>>;
    };
    bambu: {
        login: (creds: { email: string; password: string; code?: string }) => Promise<boolean>;
        getDevices: () => Promise<any[]>;
    };
}

interface Window {
    electronAPI: ElectronAPI;
}
