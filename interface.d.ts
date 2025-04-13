import { CreateChatProps, OnUpdatedCallback, AppConfig } from "./src/types";

export interface IElectronAPI {
  startChat: (data: CreateChatProps) => void;
  onUpdateMessage: (callback: OnUpdatedCallback) => any;
  copyImageToUserDir: (sourcePath: string) => Promise<string>;
  getFilePath: (file: File) => string;
  getConfig: () => Promise<AppConfig>;
  updateConfig: (config: Partial<AppConfig>) => Promise<AppConfig>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
