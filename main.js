// Modules
const {app, BrowserWindow, net} = require('electron')
const {ipcMain} = require('electron');
const {shell} = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

app.commandLine.appendSwitch('ignore-certificate-errors')

// Create a new BrowserWindow when `app` is ready
function createWindow () {

  mainWindow = new BrowserWindow({
    width: 1280, height: 720,
    webPreferences: {
      // --- !! IMPORTANT !! ---
      // Disable 'contextIsolation' to allow 'nodeIntegration'
      // 'contextIsolation' defaults to "true" as from Electron v12
      contextIsolation: false,
      nodeIntegration: true
    },
    resizable: false,
    fullscreenable: false,
    title: 'LCU Tool',
    //frame: false
    
  })
// Remove default menu
    mainWindow.setMenu(null);
  // Load index.html into the new BrowserWindow
  mainWindow.loadFile('index.html')
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
});
  // Open DevTools - Remove for PRODUCTION!
  mainWindow.webContents.openDevTools()
  // Listen for window being closed
  mainWindow.on('closed',  () => {
    mainWindow = null
  })
}

// Electron `app` is ready
app.on('ready', ()=>{
  createWindow()
  ipcMain.on('loadGH', (event, arg) => {
    shell.openExternal(arg);
  });
})


// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
