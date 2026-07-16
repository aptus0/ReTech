const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');

function getAppUrl() {
    try {
        const envPath = path.join(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/^APP_URL=(.+)$/m);
        if (match) {
            return match[1].trim().replace(/"/g, '');
        }
    } catch (e) {
        // .env okunamazsa fallback
    }
    return 'https://kobix.test';
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.removeMenu(); // Optional: Hide the menu bar

    // .env dosyasından APP_URL'yi oku
    win.loadURL(getAppUrl());
    
    if (isDev) {
        // win.webContents.openDevTools(); // Optional: Open DevTools automatically
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
