const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs');
let adb = require('./modules/adb');
let localStorage = __dirname +'/storage/';
let win;
let windows = [];
global.windows = {};
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 360,
    height: 700,
    minWidth: 360,
    minHeight: 600,
    maxWidth: 500,
    backgroundColor: '#ffffff',
    fullscreenable: false,
    frame: false,
    icon: './www/assets/imgs/SVG.png'
  })
  win.loadURL(`file://${__dirname}/www/index.html`)

  //// uncomment below to open the DevTools.

  win.webContents.openDevTools()
  // Event when the window is closed.
  win.on('closed', function () {
    win = null
  })
  global.windows['main-window'] = win;
}

function initializeLocalFile(file) {
  return new Promise((res, rej) => {
    if (!fs.existsSync(file)) {
      console.log(file);
      fs.writeFile(file, '', 'utf8', (err) => {
        if (err) {
          rej(err);
        } else {
          res(true);
        }
      });
    }
  });
}

function initializeDirectory(){
  if (!fs.existsSync(localStorage)){
    fs.mkdirSync(localStorage);
  }
}

ipcMain.on('open-window', (e, data) => {
  let win = new BrowserWindow({
    width: 800,
    height: 450,
    minWidth: 300,
    minHeight: 200,
    backgroundColor: '#ffffff',
    frame: false
  })
  win.loadURL(`file://${__dirname}/www/index.html`)

  //// uncomment below to open the DevTools.

  win.webContents.openDevTools()

  // Event when the window is closed.
  win.on('closed', () => {
    win = null;
  });

  windows.push(win);
});

adb.attach();

ipcMain.on('adb', (e, obj)=>{
  adb.process(e, obj);
})

ipcMain.on('local-store', (e, obj) => {
  let fullFile = localStorage + obj.file;
  initializeLocalFile(fullFile).then(() => {
    fs.readFile(fullFile, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
      }
      if (!data) {
        let array = []
        array.push(obj.data);
        json = JSON.stringify(array);
        fs.writeFile(fullFile, json, 'utf8', (callback) => {
          e.sender.send('local-store-reply', array);
        });
      }
      else {
        let file = JSON.parse(data); //get full db file
        let fLen = Object.keys(file).length;
        file[fLen] = obj.data;
        console.log(file);
        json = JSON.stringify(file);
        fs.writeFile(fullFile, json, 'utf8', (callback) => {
          e.sender.send('local-store-reply', file);
        });
      }
    });
  });
});

ipcMain.on('local-get', (e, obj) => {
  let fullFile = localStorage + obj.file;
  initializeLocalFile(fullFile).then(() => {
    fs.readFile(fullFile, 'utf8', (err, data) => {
      if (err || !data) {
        e.sender.send('local-get-reply', err);
      }
      else {
        let reply = JSON.parse(data);
        e.sender.send('local-get-reply', reply);
      }
    });
  });
});

function toFile(file) {
  let splitFile = file
}


// Create window on electron intialization
app.on('ready', () => {
  createWindow();
  initializeDirectory();
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow()
  }
})
