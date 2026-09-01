/**
 * api/api.ts — Centralized API service layer.
 *
 * All HTTP calls go through this module.
 * UI components never call fetch/axios directly.
 *
 * The base URL is read from the Vite proxy in dev
 * (any /api/* request is forwarded to http://localhost:8000).
 * In production, set VITE_API_URL in .env.
 */
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL ?? ''

const http = axios.create({
  baseURL: BASE,
  timeout: 120_000,
})

// ── Types ────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string
  database: string
  version?: string
}

export interface StatsResponse {
  total_users: number
  total_vehicles: number
  total_rides: number
  total_payments: number
  total_ratings: number
  total_revenue: number
  average_rating: number
  etl_rows_loaded: number
  version: string
}

export interface ChatRequest {
  message: string
}

export interface ChatInsight {
  summary: string
  key_observations: string[]
}

export interface ChatResponse {
  success: boolean
  agent: string
  question: string
  answer: string | null
  insight?: ChatInsight | null
  sql: string | null
  data: Record<string, unknown>[] | null
  steps: string[]
  error: string | null
  request_id?: string | null
  duration_ms?: number | null
}

export interface EtlResponse {
  success: boolean
  agent: string
  filename: string
  batch_id: string | null
  rows_read: number
  columns: string[] | null
  operations_performed: string[]
  duplicates_removed: number
  missing_values_handled: number
  rows_loaded: number
  rows_skipped: number
  destination: string
  answer: string | null
  error: string | null
  request_id?: string | null
  duration_ms?: number | null
}

// ── Endpoints ────────────────────────────────────────────────────

export async function checkHealth(): Promise<HealthResponse> {
  const res = await http.get<HealthResponse>('/api/health')
  return res.data
}

export async function getStats(): Promise<StatsResponse> {
  const res = await http.get<StatsResponse>('/api/stats')
  return res.data
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const res = await http.post<ChatResponse>('/api/chat', { message })
  return res.data
}

export async function uploadCsv(
  file: File,
  instructions: string = 'Clean this CSV and load it into PostgreSQL.'
): Promise<EtlResponse> {
  const form = new FormData()
  form.append('file', file)
  form.append('instructions', instructions)
  const res = await http.post<EtlResponse>('/api/etl/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

// ── Auth Interceptor & APIs ──────────────────────────────────────

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export async function login(email: string, password: string) {
  const res = await http.post('/api/auth/login', { email, password })
  return res.data
}

export async function register(name: string, email: string, password: string) {
  const res = await http.post('/api/auth/register', { name, email, password })
  return res.data
}

export async function getMe() {
  const res = await http.get('/api/auth/me')
  return res.data
}

// ── Dashboard ─────────────────────────────────────────────────────

export interface RevenueOverTimeItem {
  month: string    // "YYYY-MM"
  revenue: number
}

export interface RevenueByCityItem {
  city: string
  revenue: number
}

export interface RidesByCityItem {
  city: string
  rides: number
}

export interface TopVehicleItem {
  model: string
  revenue: number
  rides: number
}

export interface DashboardStats {
  revenue_over_time: RevenueOverTimeItem[]
  revenue_by_city:   RevenueByCityItem[]
  rides_by_city:     RidesByCityItem[]
  top_vehicles:      TopVehicleItem[]
}

export type DashboardPeriod = 'all' | '2024' | '30d' | '7d'

export async function getDashboardStats(period: DashboardPeriod = 'all'): Promise<DashboardStats> {
  const res = await http.get<DashboardStats>('/api/dashboard/stats', { params: { period } })
  return res.data
}
