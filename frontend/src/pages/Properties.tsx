import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../api'
import GoogleMapPicker from '../components/GoogleMapPicker'
import { Plus, Search, Pencil, Trash2, X, MapPin, DollarSign, Maximize2, ChevronDown, Navigation } from 'lucide-react'

const TYPES = ['residential', 'commercial', 'plot', 'villa', 'apartment']
const STATUSES = ['available', 'sold', 'rented', 'delisted']
const STATUS_COLORS: Record<string, string> = {
  available: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  sold: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  rented: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  delisted: 'bg-red-500/10 text-red-300 border-red-500/20',
}

interface Property {
  id: number
  title: string
  type: string
  location: string
  price: number
  size: number
  status: string
  agent_name: string
  amenities: string[]
  images: string[]
  created_at: string
  lat?: number | null
  lng?: number | null
  assigned_agent?: number | null
}

type PropertyForm = {
  title: string
  type: string
  location: string
  price: string
  size: string
  amenities: string
  status: string
  assigned_agent: string
  lat: string
  lng: string
}

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const formatLakhs = (value?: number) => value ? `Rs ${(value / 100000).toFixed(1)}L` : 'Rs 0.0L'

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Property | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { register, handleSubmit, reset, setValue, watch } = useForm<PropertyForm>()

  const watchedLocation = watch('location')
  const watchedLat = watch('lat')
  const watchedLng = watch('lng')

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const params: any = {}
      if (search) params.search = search
      if (typeFilter) params.type = typeFilter
      if (statusFilter) params.status = statusFilter
      const [propertiesRes, agentsRes] = await Promise.all([api.get('/properties', { params }), api.get('/auth/agents')])
      setProperties(propertiesRes.data)
      setAgents(agentsRes.data)
    } catch (err: any) {
      const message = err.response?.data?.error || 'Properties are still loading from the demo database.'
      setProperties([])
      setAgents([])
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [search, typeFilter, statusFilter])

  const openCreate = () => {
    setEditing(null)
    reset({
      type: 'residential',
      status: 'available',
      amenities: '',
      assigned_agent: '',
      lat: '',
      lng: '',
      location: '',
      price: '',
      size: '',
      title: '',
    })
    setShowModal(true)
  }

  const openEdit = (property: Property) => {
    setEditing(property)
    reset({
      ...property,
      amenities: property.amenities?.join(', ') || '',
      assigned_agent: property.assigned_agent ? String(property.assigned_agent) : '',
      lat: property.lat ? String(property.lat) : '',
      lng: property.lng ? String(property.lng) : '',
      price: property.price ? String(property.price) : '',
      size: property.size ? String(property.size) : '',
    } as PropertyForm)
    setShowModal(true)
  }

  const onSubmit = async (data: PropertyForm) => {
    const payload = {
      ...data,
      price: data.price ? Number(data.price) : null,
      size: data.size ? Number(data.size) : null,
      lat: data.lat ? Number(data.lat) : null,
      lng: data.lng ? Number(data.lng) : null,
      assigned_agent: data.assigned_agent ? Number(data.assigned_agent) : null,
      amenities: data.amenities ? data.amenities.split(',').map(item => item.trim()).filter(Boolean) : [],
      images: [],
    }

    try {
      if (editing) {
        await api.put(`/properties/${editing.id}`, payload)
        toast.success('Property updated')
      } else {
        await api.post('/properties', payload)
        toast.success('Property created')
      }
      setShowModal(false)
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  const deleteProperty = async (id: number) => {
    if (!window.confirm('Delete this property?')) return
    try {
      await api.delete(`/properties/${id}`)
      toast.success('Property deleted')
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  const geocodeAddress = async () => {
    if (!googleMapsApiKey) {
      toast.error('Add VITE_GOOGLE_MAPS_API_KEY first')
      return
    }

    if (!watchedLocation?.trim()) {
      toast.error('Enter a location before geocoding')
      return
    }

    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(watchedLocation)}&key=${googleMapsApiKey}`)
      const data = await response.json()
      const firstResult = data.results?.[0]

      if (!firstResult) {
        toast.error('No map result found for that address')
        return
      }

      setValue('location', firstResult.formatted_address)
      setValue('lat', String(firstResult.geometry.location.lat))
      setValue('lng', String(firstResult.geometry.location.lng))
      toast.success('Location pinned on the map')
    } catch {
      toast.error('Failed to geocode the address')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Properties</h1>
          <p className="mt-0.5 text-[12px] text-slate-500">{properties.length} listings with live location support</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-[12px] font-medium text-white transition-colors hover:bg-indigo-500">
          <Plus size={13} /> Add Property
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search properties..." className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] py-2 pl-8 pr-3 text-[12px] text-slate-300 outline-none transition-colors placeholder:text-slate-600 focus:border-indigo-500/40" />
        </div>
        {[['typeFilter', TYPES, setTypeFilter, typeFilter, 'All Types'], ['statusFilter', STATUSES, setStatusFilter, statusFilter, 'All Status']].map(([key, options, setter, value, placeholder]: any) => (
          <div key={key} className="relative">
            <select value={value} onChange={event => setter(event.target.value)} className="appearance-none rounded-lg border border-white/[0.07] bg-white/[0.04] py-2 pl-3 pr-8 text-[12px] text-slate-300 outline-none transition-colors focus:border-indigo-500/40">
              <option value="">{placeholder}</option>
              {(options as string[]).map(option => <option key={option} value={option} className="bg-[#0f0f1a] capitalize">{option}</option>)}
            </select>
            <ChevronDown size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full rounded-2xl border border-white/[0.06] bg-[#0f0f1a] px-6 py-16 text-center">
            <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <p className="mt-4 text-sm font-medium text-white">Loading properties</p>
            <p className="mt-1 text-[12px] text-slate-500">Listings will appear as soon as the shared demo data responds.</p>
          </div>
        ) : error ? (
          <div className="col-span-full rounded-2xl border border-amber-500/20 bg-amber-500/5 px-6 py-16 text-center">
            <p className="text-sm font-medium text-amber-300">Properties are not ready yet</p>
            <p className="mt-2 text-[12px] text-slate-400">{error}</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-white/[0.08] bg-[#0f0f1a] px-6 py-12 text-center text-slate-500">
            No properties found
          </div>
        ) : properties.map(property => (
          <div key={property.id} className="group overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f0f1a] transition-colors hover:border-white/10">
            <div className="flex h-36 items-center justify-center border-b border-white/[0.05] bg-gradient-to-br from-indigo-950/60 via-slate-900/70 to-sky-950/50">
              <span className="text-3xl font-light capitalize text-slate-700">{property.type?.charAt(0)}</span>
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="text-[13px] font-medium leading-tight text-slate-200">{property.title}</h3>
                <span className={`ml-2 shrink-0 rounded-full border px-2 py-0.5 text-[10px] capitalize ${STATUS_COLORS[property.status] || ''}`}>{property.status}</span>
              </div>
              <div className="mb-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                <MapPin size={10} />
                <span className="truncate">{property.location}</span>
              </div>
              <div className="mb-3 flex items-center gap-4">
                <div className="flex items-center gap-1 text-[12px] text-slate-300">
                  <DollarSign size={10} className="text-slate-500" />
                  {formatLakhs(property.price)}
                </div>
                <div className="flex items-center gap-1 text-[12px] text-slate-300">
                  <Maximize2 size={10} className="text-slate-500" />
                  {property.size ? `${property.size} sqft` : 'Size not set'}
                </div>
              </div>
              {property.amenities?.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {property.amenities.slice(0, 3).map(item => (
                    <span key={item} className="rounded border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-slate-500">{item}</span>
                  ))}
                  {property.amenities.length > 3 && <span className="text-[10px] text-slate-600">+{property.amenities.length - 3}</span>}
                </div>
              )}
              <div className="flex items-center justify-between border-t border-white/[0.05] pt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-slate-600">{property.agent_name || 'Unassigned'}</span>
                  {property.lat && property.lng && (
                    <a href={`https://www.google.com/maps?q=${property.lat},${property.lng}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-indigo-300 hover:text-indigo-200">
                      <Navigation size={10} />
                      Open map
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => openEdit(property)} className="rounded-lg p-1.5 text-slate-500 transition-all hover:bg-white/[0.06] hover:text-slate-200"><Pencil size={11} /></button>
                  <button onClick={() => deleteProperty(property.id)} className="rounded-lg p-1.5 text-slate-500 transition-all hover:bg-red-500/5 hover:text-red-400"><Trash2 size={11} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0f0f1a] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-white/[0.06] bg-[#0f0f1a] px-6 py-4">
              <h2 className="text-[14px] font-semibold text-white">{editing ? 'Edit Property' : 'New Property'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 transition-colors hover:text-slate-200"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Title *</label>
                    <input {...register('title', { required: true })} className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Type</label>
                    <select {...register('type')} className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40">
                      {TYPES.map(type => <option key={type} value={type} className="bg-[#0f0f1a] capitalize">{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Status</label>
                    <select {...register('status')} className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40">
                      {STATUSES.map(status => <option key={status} value={status} className="bg-[#0f0f1a] capitalize">{status}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Location *</label>
                    <div className="flex gap-2">
                      <input {...register('location', { required: true })} className="flex-1 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40" />
                      <button type="button" onClick={geocodeAddress} className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[12px] text-slate-300 transition-colors hover:bg-white/[0.06]">
                        Pin
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Price (INR)</label>
                    <input {...register('price')} type="number" className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Size (sqft)</label>
                    <input {...register('size')} type="number" className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Amenities (comma separated)</label>
                    <input {...register('amenities')} placeholder="Parking, Gym, Pool" className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Assigned Agent</label>
                    <select {...register('assigned_agent')} className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40">
                      <option value="">Unassigned</option>
                      {agents.map(agent => <option key={agent.id} value={agent.id} className="bg-[#0f0f1a]">{agent.name}</option>)}
                    </select>
                  </div>
                  <input type="hidden" {...register('lat')} />
                  <input type="hidden" {...register('lng')} />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-400">Google Maps</h3>
                    <p className="mt-1 text-[11px] text-slate-500">Pin the exact location from the address or click directly on the map.</p>
                  </div>
                  <GoogleMapPicker
                    apiKey={googleMapsApiKey}
                    address={watchedLocation}
                    lat={watchedLat ? Number(watchedLat) : null}
                    lng={watchedLng ? Number(watchedLng) : null}
                    onLocationChange={({ lat, lng }) => {
                      setValue('lat', String(lat))
                      setValue('lng', String(lng))
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-lg border border-white/[0.07] bg-white/[0.04] py-2 text-[12px] font-medium text-slate-300 transition-colors hover:bg-white/[0.07]">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-indigo-600 py-2 text-[12px] font-medium text-white transition-colors hover:bg-indigo-500">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
