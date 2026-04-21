import axios from 'axios'
import { handleDemoRequest } from './demoApi'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 4000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    try {
      return await handleDemoRequest(error.config)
    } catch {
      return Promise.reject(error)
    }
  },
)

export default api
