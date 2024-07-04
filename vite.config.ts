import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/locationApi': {
        target: "https://api.map.baidu.com/geocoding/v3",
        changeOrigin: true,
        rewrite: path => path.replace(/^\/locationApi/, '')
      },
      "/weatherApi": {
        target: "https://devapi.qweather.com//v7/weather/7d",
        changeOrigin: true,
        rewrite: path => path.replace(/^\/weatherApi/, '')
      }
    }
  }
})
