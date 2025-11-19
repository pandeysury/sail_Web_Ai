// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: true,
//     port: 5173,
//     proxy: {
//       '/api': 'http://localhost:8000', // FastAPI container name
//     },
//   },
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // allows access on LAN or Docker network
    port: 5173,        // your local React port
    proxy: {
      '/api': {
        target: 'http://localhost:8080/api',  // FastAPI backend
        // target: 'http://localhost:8080',  // FastAPI backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
