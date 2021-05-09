declare global {
  namespace NodeJS {
    interface Global {
      windows: Electron.BrowserWindow;
    }
  }
}