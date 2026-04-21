import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, Method } from 'axios'

type User = {
  id: number
  name: string
  email: string
  role: string
  password?: string
  created_at: string
}

type Lead = {
  id: number
  name: string
  phone: string
  email: string
  budget: number
  source: string
  status: string
  assigned_to: number | null
  notes: string
  created_at: string
  updated_at: string
}

type Property = {
  id: number
  title: string
  type: string
  location: string
  price: number
  size: number
  amenities: string[]
  status: string
  assigned_agent: number | null
  images: string[]
  lat: number | null
  lng: number | null
  created_at: string
}

type Client = {
  id: number
  name: string
  email: string
  phone: string
  type: string
  preferences: Record<string, string>
  created_at: string
}

type Deal = {
  id: number
  title: string
  client_id: number | null
  property_id: number | null
  agent_id: number | null
  stage: string
  value: number
  commission: number
  notes: string
  created_at: string
  updated_at: string
}

type DemoDb = {
  users: User[]
  leads: Lead[]
  properties: Property[]
  clients: Client[]
  deals: Deal[]
}

const STORAGE_KEY = 'propcrm-demo-db-v2'
const DEMO_DELAY_MS = 120
const now = new Date()

function isoDaysAgo(days: number) {
  const value = new Date(now)
  value.setDate(value.getDate() - days)
  return value.toISOString()
}

const seedDb: DemoDb = {
  users: [
    { id: 1, name: 'Guest', email: 'guest@shared.local', role: 'guest', created_at: isoDaysAgo(30) },
    { id: 2, name: 'Aarav Mehta', email: 'aarav@propcrm.demo', role: 'admin', created_at: isoDaysAgo(60) },
    { id: 3, name: 'Diya Kapoor', email: 'diya@propcrm.demo', role: 'manager', created_at: isoDaysAgo(45) },
    { id: 4, name: 'Rohan Verma', email: 'rohan@propcrm.demo', role: 'agent', created_at: isoDaysAgo(25) },
    { id: 5, name: 'Sara Iyer', email: 'sara@propcrm.demo', role: 'agent', created_at: isoDaysAgo(18) },
  ],
  leads: [
    { id: 1, name: 'Kunal Batra', phone: '9876500001', email: 'kunal@example.com', budget: 8500000, source: 'google', status: 'qualified', assigned_to: 4, notes: 'Looking for a 3BHK near golf course road.', created_at: isoDaysAgo(2), updated_at: isoDaysAgo(1) },
    { id: 2, name: 'Meera Joshi', phone: '9876500002', email: 'meera@example.com', budget: 5400000, source: 'website', status: 'contacted', assigned_to: 5, notes: 'Prefers a ready-to-move apartment in Noida.', created_at: isoDaysAgo(4), updated_at: isoDaysAgo(3) },
    { id: 3, name: 'Nikhil Rao', phone: '9876500003', email: 'nikhil@example.com', budget: 15000000, source: 'referral', status: 'closed', assigned_to: 3, notes: 'Villa buyer. Wants gated community and parking.', created_at: isoDaysAgo(8), updated_at: isoDaysAgo(5) },
    { id: 4, name: 'Ananya Sen', phone: '9876500004', email: 'ananya@example.com', budget: 6200000, source: 'facebook', status: 'new', assigned_to: null, notes: 'First time buyer comparing options.', created_at: isoDaysAgo(1), updated_at: isoDaysAgo(1) },
  ],
  properties: [
    { id: 1, title: 'Skyline Residency 3BHK', type: 'apartment', location: 'Sector 54, Gurugram', price: 9200000, size: 1680, amenities: ['Clubhouse', 'Gym', 'Parking'], status: 'available', assigned_agent: 4, images: [], lat: 28.4582, lng: 77.0966, created_at: isoDaysAgo(14) },
    { id: 2, title: 'Palm Grove Villa', type: 'villa', location: 'Noida Extension', price: 16500000, size: 3200, amenities: ['Garden', 'Security', 'Parking'], status: 'available', assigned_agent: 3, images: [], lat: 28.5355, lng: 77.391, created_at: isoDaysAgo(11) },
    { id: 3, title: 'Metro Square Office', type: 'commercial', location: 'MG Road, Bengaluru', price: 24000000, size: 4100, amenities: ['Lift', 'Conference Room', 'Power Backup'], status: 'rented', assigned_agent: 5, images: [], lat: 12.9753, lng: 77.6065, created_at: isoDaysAgo(20) },
    { id: 4, title: 'Greenview Plot', type: 'plot', location: 'Yelahanka, Bengaluru', price: 4800000, size: 2400, amenities: ['Corner Plot'], status: 'available', assigned_agent: null, images: [], lat: 13.1007, lng: 77.5963, created_at: isoDaysAgo(7) },
  ],
  clients: [
    { id: 1, name: 'Kunal Batra', email: 'kunal@example.com', phone: '9876500001', type: 'buyer', preferences: { location: 'Gurugram', budget: '85L', type: '3BHK' }, created_at: isoDaysAgo(2) },
    { id: 2, name: 'Meera Joshi', email: 'meera@example.com', phone: '9876500002', type: 'buyer', preferences: { location: 'Noida', budget: '54L', move_in: 'ready' }, created_at: isoDaysAgo(4) },
    { id: 3, name: 'Arjun Khanna', email: 'arjun@example.com', phone: '9876500008', type: 'seller', preferences: { asset: 'villa', city: 'Pune' }, created_at: isoDaysAgo(6) },
  ],
  deals: [
    { id: 1, title: 'Kunal - Skyline Residency', client_id: 1, property_id: 1, agent_id: 4, stage: 'negotiation', value: 9200000, commission: 184000, notes: 'Pricing discussion in progress.', created_at: isoDaysAgo(2), updated_at: isoDaysAgo(1) },
    { id: 2, title: 'Meera - Greenview Plot', client_id: 2, property_id: 4, agent_id: 5, stage: 'inquiry', value: 4800000, commission: 96000, notes: 'Site visit scheduled for Saturday.', created_at: isoDaysAgo(3), updated_at: isoDaysAgo(3) },
    { id: 3, title: 'Nikhil - Palm Grove Villa', client_id: 1, property_id: 2, agent_id: 3, stage: 'closed', value: 15000000, commission: 300000, notes: 'Closed after owner negotiation.', created_at: isoDaysAgo(9), updated_at: isoDaysAgo(5) },
  ],
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function loadDb(): DemoDb {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedDb))
    return deepClone(seedDb)
  }

  try {
    return { ...deepClone(seedDb), ...JSON.parse(raw) as DemoDb }
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedDb))
    return deepClone(seedDb)
  }
}

function saveDb(db: DemoDb) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

function nextId(items: Array<{ id: number }>) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

function normalizeNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function wait(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

function getPath(url?: string) {
  if (!url) return '/'
  const parsed = new URL(url, 'https://demo.local')
  return parsed.pathname.replace(/^\/api/, '') || '/'
}

function getUserName(users: User[], userId: number | null | undefined) {
  return users.find(user => user.id === userId)?.name || ''
}

function makeLeads(db: DemoDb, params: Record<string, unknown>) {
  let leads = db.leads.map(lead => ({
    ...lead,
    agent_name: getUserName(db.users, lead.assigned_to),
  }))

  if (params.status) leads = leads.filter(lead => lead.status === params.status)
  if (params.search) {
    const search = String(params.search).toLowerCase()
    leads = leads.filter(lead => [lead.name, lead.email, lead.phone].some(value => value?.toLowerCase().includes(search)))
  }

  return leads.sort((a, b) => b.created_at.localeCompare(a.created_at))
}

function makeProperties(db: DemoDb, params: Record<string, unknown>) {
  let properties = db.properties.map(property => ({
    ...property,
    agent_name: getUserName(db.users, property.assigned_agent),
  }))

  if (params.status) properties = properties.filter(property => property.status === params.status)
  if (params.type) properties = properties.filter(property => property.type === params.type)
  if (params.search) {
    const search = String(params.search).toLowerCase()
    properties = properties.filter(property => [property.title, property.location].some(value => value?.toLowerCase().includes(search)))
  }

  return properties.sort((a, b) => b.created_at.localeCompare(a.created_at))
}

function makeClients(db: DemoDb, params: Record<string, unknown>) {
  let clients = [...db.clients]

  if (params.type) clients = clients.filter(client => client.type === params.type)
  if (params.search) {
    const search = String(params.search).toLowerCase()
    clients = clients.filter(client => [client.name, client.email, client.phone].some(value => value?.toLowerCase().includes(search)))
  }

  return clients.sort((a, b) => b.created_at.localeCompare(a.created_at))
}

function joinDeal(db: DemoDb, deal: Deal) {
  return {
    ...deal,
    client_name: db.clients.find(client => client.id === deal.client_id)?.name || '',
    property_title: db.properties.find(property => property.id === deal.property_id)?.title || '',
    agent_name: getUserName(db.users, deal.agent_id),
  }
}

function makeKanban(db: DemoDb) {
  const stages = ['inquiry', 'negotiation', 'agreement', 'closed', 'lost']
  const result: Record<string, ReturnType<typeof joinDeal>[]> = {}

  for (const stage of stages) {
    result[stage] = db.deals
      .filter(deal => deal.stage === stage)
      .map(deal => joinDeal(db, deal))
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  }

  return result
}

function makeDealStats(db: DemoDb) {
  const closedDeals = db.deals.filter(deal => deal.stage === 'closed')
  const stages = ['inquiry', 'negotiation', 'agreement', 'closed', 'lost']
  const byStage = stages.map(stage => ({ stage, count: db.deals.filter(deal => deal.stage === stage).length })).filter(item => item.count > 0)
  const agentPerf = db.users
    .map(user => ({
      name: user.name,
      deal_count: closedDeals.filter(deal => deal.agent_id === user.id).length,
      total_commission: closedDeals.filter(deal => deal.agent_id === user.id).reduce((sum, deal) => sum + (deal.commission || 0), 0),
    }))
    .filter(agent => agent.deal_count > 0)
    .sort((a, b) => b.deal_count - a.deal_count)

  return {
    total: db.deals.length,
    closed: closedDeals.length,
    totalRevenue: closedDeals.reduce((sum, deal) => sum + (deal.value || 0), 0),
    totalCommission: closedDeals.reduce((sum, deal) => sum + (deal.commission || 0), 0),
    byStage,
    agentPerf,
  }
}

function makeLeadStats(db: DemoDb) {
  const sourceMap = new Map<string, number>()
  const statusMap = new Map<string, number>()

  for (const lead of db.leads) {
    sourceMap.set(lead.source, (sourceMap.get(lead.source) || 0) + 1)
    statusMap.set(lead.status, (statusMap.get(lead.status) || 0) + 1)
  }

  const recentCutoff = new Date()
  recentCutoff.setDate(recentCutoff.getDate() - 7)

  return {
    total: db.leads.length,
    thisWeek: db.leads.filter(lead => new Date(lead.created_at) >= recentCutoff).length,
    byStatus: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
    bySource: Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count })),
  }
}

function makeOverview(db: DemoDb) {
  const dealStats = makeDealStats(db)
  const propertyMap = new Map<string, number>()

  for (const property of db.properties) {
    const key = `${property.type}|${property.status}`
    propertyMap.set(key, (propertyMap.get(key) || 0) + 1)
  }

  const monthlyMap = new Map<string, { month: string; count: number; revenue: number }>()
  for (const deal of db.deals.filter(item => item.stage === 'closed')) {
    const month = deal.created_at.slice(0, 7)
    const current = monthlyMap.get(month) || { month, count: 0, revenue: 0 }
    current.count += 1
    current.revenue += deal.value || 0
    monthlyMap.set(month, current)
  }

  const leadStats = makeLeadStats(db)

  return {
    leadStats: leadStats.byStatus,
    dealStats: dealStats.byStage,
    monthlyDeals: Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month)),
    topAgents: dealStats.agentPerf.map(agent => ({ name: agent.name, deals: agent.deal_count, commission: agent.total_commission })),
    propertyStats: Array.from(propertyMap.entries()).map(([key, count]) => {
      const [type, status] = key.split('|')
      return { type, status, count }
    }),
    conversionRate: leadStats.total ? ((dealStats.closed / leadStats.total) * 100).toFixed(1) : '0',
  }
}

function makeAgents(db: DemoDb) {
  return db.users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    lead_count: db.leads.filter(lead => lead.assigned_to === user.id).length,
    deal_count: db.deals.filter(deal => deal.agent_id === user.id).length,
    total_commission: db.deals.filter(deal => deal.agent_id === user.id && deal.stage === 'closed').reduce((sum, deal) => sum + (deal.commission || 0), 0),
  }))
}

function demoResponse<T>(config: AxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 201 ? 'Created' : 'OK',
    headers: { 'x-demo-mode': 'true' },
    config: (config || { headers: {} }) as InternalAxiosRequestConfig,
  }
}

function requestBody(config: AxiosRequestConfig) {
  if (!config.data) return {}
  return typeof config.data === 'string' ? JSON.parse(config.data) : config.data
}

export async function handleDemoRequest(config: AxiosRequestConfig): Promise<AxiosResponse> {
  await wait(DEMO_DELAY_MS)

  const db = loadDb()
  const method = String(config.method || 'get').toLowerCase() as Method
  const path = getPath(config.url)
  const params = (config.params || {}) as Record<string, unknown>
  const body = requestBody(config) as Record<string, unknown>
  const timestamp = new Date().toISOString()

  if (method === 'get' && path === '/auth/agents') {
    return demoResponse(config, db.users.map(({ password, ...user }) => user))
  }

  if (method === 'get' && path === '/agents') {
    return demoResponse(config, makeAgents(db))
  }

  if (method === 'get' && path === '/agents/reports/overview') {
    return demoResponse(config, makeOverview(db))
  }

  if (method === 'post' && path === '/auth/register') {
    const user: User = {
      id: nextId(db.users),
      name: normalizeString(body.name, 'New Agent'),
      email: normalizeString(body.email, `agent${db.users.length + 1}@propcrm.demo`),
      role: normalizeString(body.role, 'agent'),
      created_at: timestamp,
    }
    db.users.unshift(user)
    saveDb(db)
    return demoResponse(config, user, 201)
  }

  if (method === 'put' && path.startsWith('/agents/')) {
    const id = Number(path.split('/')[2])
    const agent = db.users.find(user => user.id === id)
    if (!agent) throw new Error('Agent not found')
    agent.name = normalizeString(body.name, agent.name)
    agent.email = normalizeString(body.email, agent.email)
    agent.role = normalizeString(body.role, agent.role)
    saveDb(db)
    return demoResponse(config, agent)
  }

  if (method === 'delete' && path.startsWith('/agents/')) {
    const id = Number(path.split('/')[2])
    db.users = db.users.filter(user => user.id !== id)
    db.leads = db.leads.map(lead => lead.assigned_to === id ? { ...lead, assigned_to: null } : lead)
    db.properties = db.properties.map(property => property.assigned_agent === id ? { ...property, assigned_agent: null } : property)
    saveDb(db)
    return demoResponse(config, { message: 'Agent deleted' })
  }

  if (method === 'get' && path === '/leads') {
    return demoResponse(config, makeLeads(db, params))
  }

  if (method === 'get' && path === '/leads/stats') {
    return demoResponse(config, makeLeadStats(db))
  }

  if (method === 'post' && path === '/leads') {
    const lead: Lead = {
      id: nextId(db.leads),
      name: normalizeString(body.name, 'New Lead'),
      phone: normalizeString(body.phone),
      email: normalizeString(body.email),
      budget: normalizeNumber(body.budget) || 0,
      source: normalizeString(body.source, 'manual'),
      status: normalizeString(body.status, 'new'),
      assigned_to: normalizeNumber(body.assigned_to),
      notes: normalizeString(body.notes),
      created_at: timestamp,
      updated_at: timestamp,
    }
    db.leads.unshift(lead)
    saveDb(db)
    return demoResponse(config, lead, 201)
  }

  if (method === 'put' && path.startsWith('/leads/')) {
    const id = Number(path.split('/')[2])
    const lead = db.leads.find(item => item.id === id)
    if (!lead) throw new Error('Lead not found')
    lead.name = normalizeString(body.name, lead.name)
    lead.phone = normalizeString(body.phone, lead.phone)
    lead.email = normalizeString(body.email, lead.email)
    lead.budget = normalizeNumber(body.budget) || 0
    lead.source = normalizeString(body.source, lead.source)
    lead.status = normalizeString(body.status, lead.status)
    lead.assigned_to = normalizeNumber(body.assigned_to)
    lead.notes = normalizeString(body.notes, lead.notes)
    lead.updated_at = timestamp
    saveDb(db)
    return demoResponse(config, lead)
  }

  if (method === 'delete' && path.startsWith('/leads/')) {
    const id = Number(path.split('/')[2])
    db.leads = db.leads.filter(item => item.id !== id)
    saveDb(db)
    return demoResponse(config, { message: 'Lead deleted' })
  }

  if (method === 'get' && path === '/properties') {
    return demoResponse(config, makeProperties(db, params))
  }

  if (method === 'post' && path === '/properties') {
    const property: Property = {
      id: nextId(db.properties),
      title: normalizeString(body.title, 'New Property'),
      type: normalizeString(body.type, 'residential'),
      location: normalizeString(body.location, 'Unknown location'),
      price: normalizeNumber(body.price) || 0,
      size: normalizeNumber(body.size) || 0,
      amenities: Array.isArray(body.amenities) ? body.amenities.map(String) : [],
      status: normalizeString(body.status, 'available'),
      assigned_agent: normalizeNumber(body.assigned_agent),
      images: Array.isArray(body.images) ? body.images.map(String) : [],
      lat: normalizeNumber(body.lat),
      lng: normalizeNumber(body.lng),
      created_at: timestamp,
    }
    db.properties.unshift(property)
    saveDb(db)
    return demoResponse(config, property, 201)
  }

  if (method === 'put' && path.startsWith('/properties/')) {
    const id = Number(path.split('/')[2])
    const property = db.properties.find(item => item.id === id)
    if (!property) throw new Error('Property not found')
    property.title = normalizeString(body.title, property.title)
    property.type = normalizeString(body.type, property.type)
    property.location = normalizeString(body.location, property.location)
    property.price = normalizeNumber(body.price) || 0
    property.size = normalizeNumber(body.size) || 0
    property.amenities = Array.isArray(body.amenities) ? body.amenities.map(String) : property.amenities
    property.status = normalizeString(body.status, property.status)
    property.assigned_agent = normalizeNumber(body.assigned_agent)
    property.images = Array.isArray(body.images) ? body.images.map(String) : property.images
    property.lat = normalizeNumber(body.lat)
    property.lng = normalizeNumber(body.lng)
    saveDb(db)
    return demoResponse(config, property)
  }

  if (method === 'delete' && path.startsWith('/properties/')) {
    const id = Number(path.split('/')[2])
    db.properties = db.properties.filter(item => item.id !== id)
    saveDb(db)
    return demoResponse(config, { message: 'Property deleted' })
  }

  if (method === 'get' && path === '/clients') {
    return demoResponse(config, makeClients(db, params))
  }

  if (method === 'post' && path === '/clients') {
    const client: Client = {
      id: nextId(db.clients),
      name: normalizeString(body.name, 'New Client'),
      email: normalizeString(body.email),
      phone: normalizeString(body.phone),
      type: normalizeString(body.type, 'buyer'),
      preferences: typeof body.preferences === 'object' && body.preferences ? body.preferences as Record<string, string> : {},
      created_at: timestamp,
    }
    db.clients.unshift(client)
    saveDb(db)
    return demoResponse(config, client, 201)
  }

  if (method === 'put' && path.startsWith('/clients/')) {
    const id = Number(path.split('/')[2])
    const client = db.clients.find(item => item.id === id)
    if (!client) throw new Error('Client not found')
    client.name = normalizeString(body.name, client.name)
    client.email = normalizeString(body.email, client.email)
    client.phone = normalizeString(body.phone, client.phone)
    client.type = normalizeString(body.type, client.type)
    client.preferences = typeof body.preferences === 'object' && body.preferences ? body.preferences as Record<string, string> : {}
    saveDb(db)
    return demoResponse(config, client)
  }

  if (method === 'delete' && path.startsWith('/clients/')) {
    const id = Number(path.split('/')[2])
    db.clients = db.clients.filter(item => item.id !== id)
    db.deals = db.deals.map(deal => deal.client_id === id ? { ...deal, client_id: null } : deal)
    saveDb(db)
    return demoResponse(config, { message: 'Client deleted' })
  }

  if (method === 'get' && path === '/deals/kanban') {
    return demoResponse(config, makeKanban(db))
  }

  if (method === 'get' && path === '/deals/stats') {
    return demoResponse(config, makeDealStats(db))
  }

  if (method === 'post' && path === '/deals') {
    const deal: Deal = {
      id: nextId(db.deals),
      title: normalizeString(body.title, 'New Deal'),
      client_id: normalizeNumber(body.client_id),
      property_id: normalizeNumber(body.property_id),
      agent_id: normalizeNumber(body.agent_id) || 1,
      stage: normalizeString(body.stage, 'inquiry'),
      value: normalizeNumber(body.value) || 0,
      commission: normalizeNumber(body.commission) || 0,
      notes: normalizeString(body.notes),
      created_at: timestamp,
      updated_at: timestamp,
    }
    db.deals.unshift(deal)
    saveDb(db)
    return demoResponse(config, deal, 201)
  }

  if (method === 'put' && path.startsWith('/deals/')) {
    const id = Number(path.split('/')[2])
    const deal = db.deals.find(item => item.id === id)
    if (!deal) throw new Error('Deal not found')
    deal.title = normalizeString(body.title, deal.title)
    deal.client_id = normalizeNumber(body.client_id)
    deal.property_id = normalizeNumber(body.property_id)
    deal.agent_id = normalizeNumber(body.agent_id)
    deal.stage = normalizeString(body.stage, deal.stage)
    deal.value = normalizeNumber(body.value) || 0
    deal.commission = normalizeNumber(body.commission) || 0
    deal.notes = normalizeString(body.notes, deal.notes)
    deal.updated_at = timestamp
    saveDb(db)
    return demoResponse(config, deal)
  }

  if (method === 'patch' && path.endsWith('/stage')) {
    const id = Number(path.split('/')[2])
    const deal = db.deals.find(item => item.id === id)
    if (!deal) throw new Error('Deal not found')
    deal.stage = normalizeString(body.stage, deal.stage)
    deal.updated_at = timestamp
    saveDb(db)
    return demoResponse(config, { message: 'Stage updated' })
  }

  if (method === 'delete' && path.startsWith('/deals/')) {
    const id = Number(path.split('/')[2])
    db.deals = db.deals.filter(item => item.id !== id)
    saveDb(db)
    return demoResponse(config, { message: 'Deal deleted' })
  }

  throw new Error(`No demo route for ${method?.toUpperCase()} ${path}`)
}
