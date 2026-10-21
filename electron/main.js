const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let backendProcess;
const BACKEND_PORT = process.env.PORT || 54321;

function startBackend() {
  const backendScript = path.join(__dirname, '../backend/src/server.js');
  const templateDir = path.join(__dirname, '../report-templates');

  backendProcess = fork(backendScript, [], {
    env: {
      ...process.env,
      PORT: String(BACKEND_PORT),
      NODE_ENV: 'production',
      ATTENX_TEMPLATES_DIR: templateDir,
    },
    silent: true,
  });

  if (backendProcess.stdout) {
    backendProcess.stdout.on('data', (d) => console.log('[Backend]', d.toString()));
  }
  if (backendProcess.stderr) {
    backendProcess.stderr.on('data', (d) => console.error('[Backend ERR]', d.toString()));
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1080,
    minHeight: 700,
    title: 'AttenX - NBA CO-PO Attainment Workbench',
    icon: path.join(__dirname, '../frontend/src/assets/attainx-logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: false,
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupAutoUpdater() {
  if (process.env.NODE_ENV === 'development') return;

  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-downloaded', () => {
    dialog
      .showMessageBox(mainWindow, {
        type: 'info',
        title: 'AttenX Update Available',
        message: 'A new version of AttenX has been downloaded. Restart now to apply updates?',
        buttons: ['Restart and Update', 'Later'],
        defaultId: 0,
      })
      .then((res) => {
        if (res.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    try {
      backendProcess.kill();
    } catch (e) {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
