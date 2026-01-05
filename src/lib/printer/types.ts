export interface PrinterConnection {
    devId: string;
    devName: string;
    devIp: string;
    accessCode: string;
    connectionType: 'lan' | 'cloud';
    useSslForFtp: boolean;
    useSslForMqtt: boolean;
}

export interface PrintJob {
    projectName: string;
    filename: string;
    plateIndex: number;
    amsMapping?: string;
    useAms: boolean;
    bedLeveling: boolean;
    flowCalibration: boolean;
    timelapse: boolean;
    // Additional fields from OrcaSlicer PrintParams
    taskId?: string;
    url?: string;
    md5?: string;
}

export enum PrintStage {
    Create = 0,
    Upload = 1,
    Waiting = 2,
    Sending = 3,
    Finished = 4,
    Error = 5,
    Running = 6, // Added Running state
    Idle = 7     // Added Idle state
}

export interface PrintStatus {
    stage: PrintStage;
    progress: number;
    message: string;
    errorCode?: number;
    timeLeft?: number; // Estimated time remaining in minutes
    currentLayer?: number;
    totalLayers?: number;
    temperatures?: {
        nozzle: number;
        bed: number;
        targetNozzle: number;
        targetBed: number;
    };
}

// Bambu Lab specific mapping
export interface OrcaBambuStats {
    print_status: string;
    mc_percent: number;
    mc_remaining_time: number;
    wifi_signal: string;
    nozzle_temper: number;
    bed_temper: number;
    nozzle_target_temper: number;
    bed_target_temper: number;
    layer_num: number;
    total_layer_num: number;
}
