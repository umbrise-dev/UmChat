import { app, BrowserWindow, net, protocol } from 'electron';
import path from 'path';
import 'dotenv/config';
import { pathToFileURL } from 'url';
import { configManager } from './config';
import { createMenu } from './menu';
import { setupIPC } from './ipc';

// Register schemes as privileged before the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'safe-file',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
    },
  },
]);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (process.platform === 'win32') {
  try {
    const electronSquirrelStartup = require('electron-squirrel-startup');
    if (electronSquirrelStartup) {
      app.quit();
      process.exit(0);
    }
  } catch (e) {
    console.warn('Failed to load electron-squirrel-startup:', e);
  }
}

const createWindow = async () => {
  await configManager.load()

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: 'Vue Electron Chat',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  createMenu(mainWindow)
  setupIPC(mainWindow)

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  protocol.handle('safe-file', async (request) => {
    const userDataPath = app.getPath('userData')
    const imageDir = path.join(userDataPath, 'images')
    const filePath = path.join(
      decodeURIComponent(request.url.slice('safe-file:/'.length))
    )
    const filename = path.basename(filePath)
    const fileAddr = path.join(imageDir, filename)
    const newFilePath = pathToFileURL(fileAddr).toString()
    return net.fetch(newFilePath)
  })
});
