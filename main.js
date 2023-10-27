const { app, BrowserWindow } = require("electron");
const path = require("path");
const { sequelize, DataTypes } = require("./config/database");

const mainWindow = () => {
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
    },
    // width: 800,
    // height: 600,
  });
  mainWindow.maximize();

   //mainWindow.webContents.openDevTools();

  mainWindow.loadFile("src/screens/login.html");
};

// Getting all Models to create tables in our database
require("./src/models/index")(sequelize, DataTypes);

// Syncing Database
sequelize.sync({ force: false }).then(() => {
  console.log("Industrial Pressing database well synced");
});

app.whenReady().then(() => {
  mainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
