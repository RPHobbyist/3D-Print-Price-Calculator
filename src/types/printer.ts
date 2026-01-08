export interface BambuDevice {
    dev_id: string;
    name: string;
    model: string;
    dev_access_code?: string;
    access_code?: string;
    user_id?: string;
    online?: boolean;
    print_status?: string;
    id: string; // Ensure id is present or mapped
}

export interface PrinterConnection {
    ip: string;
    serial: string;
    status: string;
    cloudMode?: boolean;
    // Runtime status fields
    printState?: string;
    progress?: number;
    remainingTime?: number;
}

export interface PrintOptions {
    [key: string]: string | number | boolean | undefined;
    plate?: number;
    use_ams?: boolean;
    timelapse?: boolean;
    bed_levelling?: boolean;
    flow_cali?: boolean;
    vibration_cali?: boolean;
    layer_inspect?: boolean;
}
