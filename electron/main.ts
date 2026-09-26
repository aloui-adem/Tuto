import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  win.setMenu(null)

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL).catch((err) => {
      console.warn('Dev server loading...', err)
    })
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html')).catch((err) => {
      console.error('Failed to load HTML:', err)
    })
  }
}

app.whenReady().then(createWindow).catch((err) => {
  console.error('Failed to launch Electron app:', err)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
