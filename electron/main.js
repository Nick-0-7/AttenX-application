const { app, BrowserWindow, dialog, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { fork } = require('child_process');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let backendProcess;
let isManualUpdateCheck = false;
const BACKEND_PORT = process.env.PORT || 54321;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

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

function buildMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for Updates...',
          click: () => {
            isManualUpdateCheck = true;
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Checking for Updates',
              message: 'Connecting to update server to check for latest AttenX releases...',
              buttons: ['OK'],
            });
            autoUpdater.checkForUpdates().catch((err) => {
              dialog.showErrorBox(
                'Update Check Failed',
                'Unable to check for updates: ' + (err.message || 'Unknown network error')
              );
            });
          },
        },
        { type: 'separator' },
        {
          label: 'About AttenX',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About AttenX',
              message: 'AttenX Desktop Workbench\nVersion: ' + app.getVersion() + '\nOffline NBA CO-PO Attainment System',
              detail: 'Repository: https://github.com/Nick-0-7/AttenX-application',
              buttons: ['OK'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
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

  buildMenu();

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

    autoUpdater.on('update-available', (info) => {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Found',
        message: 'Version ' + info.version + ' of AttenX is available!',
        detail: 'The update is downloading automatically in the background. You will be prompted when it is ready to install.',
        buttons: ['OK'],
      });
    });

    autoUpdater.on('update-not-available', (info) => {
      if (isManualUpdateCheck) {
        isManualUpdateCheck = false;
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'You are Up to Date',
          message: 'AttenX v' + app.getVersion() + ' is the latest version.',
          detail: 'No newer updates were found on GitHub.',
          buttons: ['OK'],
        });
      }
    });

    autoUpdater.on('error', (err) => {
      console.log('[AutoUpdater Error]', err);
      if (isManualUpdateCheck) {
        isManualUpdateCheck = false;
        dialog.showErrorBox(
          'Update Check Failed',
          'Could not retrieve update information:\n' + (err.message || 'Unknown error')
        );
      }
    });

    autoUpdater.on('update-downloaded', (info) => {
      dialog
        .showMessageBox(mainWindow, {
          type: 'info',
          title: 'Update Ready to Install',
          message: 'AttenX version ' + info.version + ' has finished downloading!',
          detail: 'Would you like to restart AttenX now to apply the update?',
          buttons: ['Restart & Install', 'Later'],
          defaultId: 0,
        })
        .then((res) => {
          if (res.response === 0) {
            autoUpdater.quitAndInstall();
          }
        });
    });

    autoUpdater.checkForUpdatesAndNotify().catch((e) => {
      console.log('[AutoUpdater Startup Check skipped/failed]:', e.message);
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
