import { app, BrowserWindow, nativeImage } from 'electron';
import path from 'path';

// Note: In .cts files, 'require' and '__dirname' might need to be accessed differently 
// if strict ESM interop is on, but for Electron CJS output, usually we can just rely 
// on TS compiling imports to requires. 
// However, to be absolutely safe and standard for Electron CJS:

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

// Get the correct icon path for both dev and production
// In production, extraResources copies logo.ico to resources folder
function getIconPath(): string {
    return app.isPackaged
        ? path.join(process.resourcesPath, 'logo.ico')
        : path.join(__dirname, '..', 'public', 'logo.ico');
}

function createWindow() {
    const iconPath = getIconPath();

    // Create native image for better Windows taskbar support
    const appIcon = nativeImage.createFromPath(iconPath);

    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        title: "3D Print Price Calculator",
        icon: appIcon
    });

    // Explicitly set the icon for Windows taskbar
    if (process.platform === 'win32') {
        win.setIcon(appIcon);
    }

    // Remove the default menu
    win.removeMenu();

    // In development mode, load from the Vite dev server
    const isDev = !app.isPackaged;

    if (isDev) {
        win.loadURL('http://localhost:8080');
        // Open the DevTools.
        win.webContents.openDevTools();
    } else {
        // In production, load the built index.html
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
