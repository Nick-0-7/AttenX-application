const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { fork } = require('child_process');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let backendProcess;
const BACKEND_PORT = process.env.PORT || 54321;

function getAppRoot() {
  return app.isPackaged ? path.join(process.resourcesPath, 'app') : path.join(__dirname, '..');
}

function startBackend() {
  try {
    const appRoot = getAppRoot();
    const backendScript = path.join(appRoot, 'backend/src/server.js');
    const templateDir = path.join(appRoot, 'report-templates');
    const userDataDir = app.getPath('userData');
    
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }
    
    const dbPath = path.join(userDataDir, 'attenx.db');
    const defaultDbPath = path.join(appRoot, 'backend/prisma/attenx.db');
    
    if (!fs.existsSync(dbPath) && fs.existsSync(defaultDbPath)) {
      try {
        fs.copyFileSync(defaultDbPath, dbPath);
        console.log('[App] Copied seed database to:', dbPath);
      } catch (e) {
        console.error('[App] Failed to copy seed database:', e);
      }
    }

    const dbUrl = 'file:' + dbPath.replace(/\\/g, '/');
    console.log('[App] Launching backend:', backendScript);
    console.log('[App] SQLite database URL:', dbUrl);

    backendProcess = fork(backendScript, [], {
      env: {
        ...process.env,
        PORT: String(BACKEND_PORT),
        NODE_ENV: 'production',
        DATABASE_URL: dbUrl,
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

    backendProcess.on('error', (err) => console.error('[Backend Process Error]', err));
    backendProcess.on('exit', (code) => console.log('[Backend Process Exited]', code));
  } catch (err) {
    console.error('[StartBackend Exception]', err);
  }
}

function createWindow() {
  const appRoot = getAppRoot();
  const iconPath = path.join(appRoot, 'frontend/src/assets/attainx-logo.png');

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1080,
    minHeight: 700,
    title: 'AttenX - NBA CO-PO Attainment Workbench',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
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
    const indexPath = path.join(appRoot, 'frontend/dist/index.html');
    console.log('[App] Loading index.html from:', indexPath);
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('[App] Failed to load index.html:', err);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupAutoUpdater() {
  try {
    if (process.env.NODE_ENV === 'development') return;

    autoUpdater.checkForUpdatesAndNotify().catch((e) => {
      console.log('[AutoUpdater] Check skipped/failed:', e.message);
    });

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
  } catch (e) {
    console.log('[AutoUpdater Setup Error]', e.message);
  }
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
