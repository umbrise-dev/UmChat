import { app, BrowserWindow, ipcMain, net, protocol } from 'electron';
import path from 'path';
import 'dotenv/config';
import { CreateChatProps } from "./types";
import fs from 'fs/promises';
import { pathToFileURL } from 'url';
import util from 'util';
import { createProvider } from './providers/createProivder';
import { configManager } from './config';

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
  const config = await configManager.load()
  console.log('config:', util.inspect(config, { depth: null, colors: true }))

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  ipcMain.handle('copy-image-to-user-dir', async (event, sourcePath: string) => {
    const userDataPath = app.getPath('userData');
    const imagesDir = path.join(userDataPath, 'images');
    await fs.mkdir(imagesDir, { recursive: true });
    const fileNames = path.basename(sourcePath);
    const targetPath = path.join(imagesDir, fileNames);
    await fs.copyFile(sourcePath, targetPath);
    return targetPath;
  });

  ipcMain.on('start-chat', async (event, data: CreateChatProps ) => {
    console.log('hey', data)
    const { providerName, messages, messageId, selectedModel } = data
    try {
      const provider = createProvider(providerName)
      const stream = await provider.chat(messages, selectedModel)
      for await (const chunk of stream) {
        console.log('the chunk', chunk)
        const content = {
          messageId,
          data: chunk
        }
        mainWindow.webContents.send('update-message', content)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorContent = {
        messageId,
        data: {
          is_end: true,
          result: error instanceof Error ? error.message : '与AI服务通信时发生错误',
          is_error: true
        }
      }
      mainWindow.webContents.send('update-message', errorContent)
    }
  })

  ipcMain.handle('get-config', () => {
    return configManager.get()
  })

  ipcMain.handle('update-config', async (event, newConfig) => {
    return await configManager.update(newConfig)
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
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
