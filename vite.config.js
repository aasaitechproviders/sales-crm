import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const LAMBDA = 'https://ohy67ygya4tecyunrbrigeygdm0evtoq.lambda-url.ap-southeast-2.on.aws'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth':   { target: LAMBDA, changeOrigin: true, secure: true },
      '/agents': { target: LAMBDA, changeOrigin: true, secure: true },
      '/leads':  { target: LAMBDA, changeOrigin: true, secure: true },
      '/visits': { target: LAMBDA, changeOrigin: true, secure: true },
      '/upload': { target: LAMBDA, changeOrigin: true, secure: true },
      '/admin':  { target: LAMBDA, changeOrigin: true, secure: true },
    }
  }
})
