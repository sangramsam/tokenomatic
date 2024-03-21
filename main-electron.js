// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  Menu
} = require('electron')
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

var remote = require('electron').remote;
const package = require('./package');
const path = require('path')
const url = require('url')
const config = require('./config/config')
const isDev = require('electron-is-dev');
const windowStateKeeper = require('electron-window-state');
const Store = require('electron-store');
const Splashscreen = require("@trodi/electron-splashscreen");


const store = new Store();
store.delete('network');
store.delete('blockchain');
store.set('network', 'MAINNET');
store.set('blockchain', 'ETH');
var menus = [];
var severConfig;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

var setting;
config.getConfig(function (res) {
  menus = [];
  setting = res;
  // console.log("setting", setting.blockchain)
  //console.log("blockchain", Object.keys(setting.blockchain));
  var b = Object.keys(setting.blockchain);
  for (var i = 0; i < b.length; i++) {
    console.log(b[i]);
    var temp = {};
    temp.head = b[i];
    var tem = b[i];
    temp.submenu = Object.keys(setting.blockchain[tem])
    console.log(Object.keys(setting.blockchain[tem]));
    menus.push(temp)
    //console.log("menus",menus)
  }
  updateMenuUI();
});
let mainWindow

function openUpdatePopUp() {
  console.log('openUpdatePopUp');
  var child = new BrowserWindow({
    width: 500,
    backgroundColor: '#FFFFFF',
    height: 200,
    center: true,
    resizable: true,
    useContentSize: true,
    titleBarStyle: 'hidden', // hidden-inset: more space
    autoHideMenuBar: true, // TODO: test on windows
    webPreferences: {
      textAreasAreResizable: false,
      nodeIntegration: true,
      preload: path.join(__dirname, 'assets/updateChecker.js')
    },
    parent: 120,
    modal: true,
    show: true
  });
  child.loadURL(url.format({
    pathname: path.join(__dirname, 'config/updatePopup.html'),
    protocol: 'file:',
    slashes: true
  }))
}

function createWindow() {
  // Create the browser window.
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 750
  });
  let mainOpts = {
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height,
    icon: path.join(__dirname, 'icons/mac/wandx_logo.icns'),
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'assets/preload.js')
    }
  }
  let splashConfig = {
    windowOpts: mainOpts,
    templateUrl: path.join(__dirname, 'splash/splash.html'),
    splashScreenOpts: {
      width: 400,
      height: 300,
      transparent: true
    },
  };
  mainWindow = Splashscreen.initSplashScreen(splashConfig)
  // mainWindow = new BrowserWindow({
  //   'x': mainWindowState.x,
  //   'y': mainWindowState.y,
  //   'width': mainWindowState.width,
  //   'height': mainWindowState.height,
  //   icon: path.join(__dirname, 'icons/mac/wandx_logo.icns'),
  //   webPreferences: {
  //     nodeIntegration: true,
  //     preload: path.join(__dirname, 'assets/preload.js')
  //   }
  // })
  mainWindowState.manage(mainWindow);
  config.init(function (callaback) {
    if (callaback)
      console.log("callaback", callaback)
    severConfig = callaback.DappServer;
    //console.log("severConfig", severConfig)
    if (isDev) {
      if (store.get('network') === "TESTNET") {
        console.log("called if", store.get('network'))
        mainWindow.loadURL("http://localhost:4200")
        //mainWindow.loadURL(severConfig.localServer)
        //mainWindow.loadFile("app/index.html")
      } else if (store.get('network') === "PRIVATENET") {
        mainWindow.loadURL("http://localhost:4200")
        // mainWindow.loadURL(severConfig.localServer)
        //mainWindow.loadFile("app/index.html")
      } else {
        console.log("called else", store.get('network'))
        mainWindow.loadURL("http://localhost:4200")
        //mainWindow.loadURL(severConfig.mainnet)
        // mainWindow.loadFile("app/index.html")

      }
    } else {
      if (store.get('network') === "TESTNET") {
        mainWindow.loadURL("http://localhost:4200")
        //mainWindow.loadURL(severConfig.testNet)
        // mainWindow.loadFile("app/index.html")
      } else if (store.get('network') === "PRIVATENET") {
        mainWindow.loadURL("http://localhost:4200")
        //mainWindow.loadURL(severConfig.localServer)
        //mainWindow.loadFile("app/index.html")
      } else {
        mainWindow.loadURL("http://localhost:4200")
        //mainWindow.loadURL(severConfig.mainnet)
        //mainWindow.loadFile("app/index.html")
      }
    }
  });

  // mainWindow.openDevTools()
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
  // Create the Application's main menu
  /*var template = [{
    label: "Application",
    submenu: [
      {type: "separator"},
      {
        label: "Check for update..",
        click: function () {
          openUpdatePopUp();
        }
      },
      {
        label: "Quit", accelerator: "Command+Q", click: function () {
          app.quit();
        }
      }
    ]
  },
    {
      label: "Edit",
      submenu: [
        {label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:"},
        {label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:"},
        {type: "separator"},
        {label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:"},
        {label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
        {label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"},
        {label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:"},
      ]
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'}
      ]
    },
    {
      label: 'Develop',
      submenu: [
        {
          label: "Network",
          submenu: [
            {
              label: 'Mainet',
              accelerator: 'CommandOrControl+Alt+1',
              checked: store.get('network') === 'mainnet',
              type: 'checkbox',
              click: function () {
                store.set('network', 'mainnet');
                console.log(store.get('network'));
                renderApp();
              }
            },
            {
              label: 'Testnet',
              accelerator: 'CommandOrControl+Alt+2',
              checked: store.get('network') === 'testnet',
              type: 'checkbox',
              click: function () {
                store.set('network', 'testnet');
                console.log(store.get('network'));
                renderApp();
              }
            }
          ],
        }
      ]

    },
    {
      label: 'Developer',
      submenu: [
        {role: 'toggledevtools'}
      ]
    }
  ];
  if (isDev) {
    if (store.get('network') === "testnet" || store.get('network') === "mainnet") {
      template.push({
        label: 'Developer',
        submenu: [
          {role: 'toggledevtools'}
        ]
      })
    }
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));*/
  changeMenuUI();
  updateMenuUI();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    store.clear();
    app.quit();
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  console.log("activate")
  if (mainWindow === null) {
    createWindow()
  }
})

function renderApp() {
  if (store.get('network') === "TESTNET") {
    mainWindow.loadURL("http://localhost:4200")
    //mainWindow.loadURL(severConfig.testNet)
    //mainWindow.loadFile("app/index.html")
    changeMenuUI();
    updateMenuUI();
  } else if (store.get('network') === "PRIVATENET") {
    mainWindow.loadURL("http://localhost:4200")
    //mainWindow.loadURL(severConfig.localServer)
    //mainWindow.loadFile("app/index.html")
    changeMenuUI();
    updateMenuUI();
  } else {
    mainWindow.loadURL("http://localhost:4200")
    console.log("called else", store.get('network'))
    //mainWindow.loadURL(severConfig.mainnet)
    //mainWindow.loadFile("app/index.html")
    changeMenuUI();
    updateMenuUI();
  }
}

function changeMenuUI() {
  var template = [{
    label: "Application",
    submenu: [{
      type: "separator"
    },
    {
      label: "Check for update..",
      click: function () {
        openUpdatePopUp();
      }
    },
    {
      label: "Quit",
      accelerator: "Command+Q",
      click: function () {
        app.quit();
      }
    }
    ]
  },
  {
    label: "Edit",
    submenu: [{
      label: "Undo",
      accelerator: "CmdOrCtrl+Z",
      selector: "undo:"
    },
    {
      label: "Redo",
      accelerator: "Shift+CmdOrCtrl+Z",
      selector: "redo:"
    },
    {
      type: "separator"
    },
    {
      label: "Cut",
      accelerator: "CmdOrCtrl+X",
      selector: "cut:"
    },
    {
      label: "Copy",
      accelerator: "CmdOrCtrl+C",
      selector: "copy:"
    },
    {
      label: "Paste",
      accelerator: "CmdOrCtrl+V",
      selector: "paste:"
    },
    {
      label: "Select All",
      accelerator: "CmdOrCtrl+A",
      selector: "selectAll:"
    },

    ]
  },
  {
    label: 'View',
    submenu: [{
      role: 'reload'
    }]
  }
  ];
  if (isDev) {
    if (store.get('network') === "TESTNET" || store.get('network') === "MAINNET" || store.get('network') === "PRIVATENET") {
      template.push({
        label: 'Developer',
        submenu: [{
          role: 'toggledevtools'
        }]
      })
    }

  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function updateMenuUI() {
  var template = [{
    label: "Application",
    submenu: [{
      type: "separator"
    },
    {
      label: "Check for update..",
      click: function () {
        openUpdatePopUp();
      }
    },
    {
      label: "Quit",
      accelerator: "Command+Q",
      click: function () {
        app.quit();
      }
    }
    ]
  },
  {
    label: "Edit",
    submenu: [{
      label: "Undo",
      accelerator: "CmdOrCtrl+Z",
      selector: "undo:"
    },
    {
      label: "Redo",
      accelerator: "Shift+CmdOrCtrl+Z",
      selector: "redo:"
    },
    {
      type: "separator"
    },
    {
      label: "Cut",
      accelerator: "CmdOrCtrl+X",
      selector: "cut:"
    },
    {
      label: "Copy",
      accelerator: "CmdOrCtrl+C",
      selector: "copy:"
    },
    {
      label: "Paste",
      accelerator: "CmdOrCtrl+V",
      selector: "paste:"
    },
    {
      label: "Select All",
      accelerator: "CmdOrCtrl+A",
      selector: "selectAll:"
    },
    ]
  },
  {
    label: 'View',
    submenu: [{
      role: 'reload'
    }]
  },
  ];
  var submenus = [];
  for (var i = 0; i < menus.length; i++) {
    var menu = {};
    var submeenu = []
    menu.label = menus[i].head;
    for (var j = 0; j < menus[i].submenu.length; j++) {
      let head = menus[i].head;
      let ss = menus[i].submenu[j]
      var submenu = {
        label: menus[i].submenu[j],
        accelerator: 'CommandOrControl+Alt+1',
        checked: store.get('network') === menus[i].submenu[j],
        type: 'checkbox',
        click: function () {
          store.set('network', ss);
          store.set('blockchain', head);
          renderApp();
        }
      }
      console.log("submenu", submenu)

      submeenu.push(submenu);
      menu.submenu = submeenu;
    }
    submenus.push(menu);
  }
  var final = {
    label: 'Network',
    submenu: submenus
  }
  //console.log("final",final)
  template.push(final);
  if (isDev) {
    console.log("store.get('network')", store.get('network'))
    if (store.get('network') === "TESTNET" || store.get('network') === "MAINNET" || store.get('network') === "PRIVATENET") {
      template.push({
        label: 'Developer',
        submenu: [{
          role: 'toggledevtools'
        }]
      })
    }
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
