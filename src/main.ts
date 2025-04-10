import { app, BrowserWindow, ipcMain, net, protocol } from 'electron';
import path from 'path';
import 'dotenv/config';
import { CreateChatProps } from "./types";
import { ChatCompletion } from '@baiducloud/qianfan';
import OpenAI from 'openai';
import fs from 'fs/promises';
import { convertMessages } from './helper';
import { pathToFileURL } from 'url';
import { createProvider } from './providers/createProivder';

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
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = async () => {
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

  ipcMain.on('start-chat', async (event, data: CreateChatProps) => {
    const { providerName, messages, messageId, selectedModel } = data;
    const provider = createProvider(providerName)
    const stream = await provider.chat(messages, selectedModel)
    for await(const chunk of stream) {
      const content = {
        messageId,
        data: chunk,
      }
      mainWindow.webContents.send('update-message', content)
    }
  });

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
