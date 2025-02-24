import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// import fs from 'fs'
// import path from 'path'

// const Server={
//   host: '192.168.1.2',
//   port: 5173,
//   https: {
//     key: fs.readFileSync(path.resolve(__dirname, './cert/192.168.1.2-key.pem')),
//     cert: fs.readFileSync(path.resolve(__dirname, './cert/192.168.1.2.pem')),
//   },
// }
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
