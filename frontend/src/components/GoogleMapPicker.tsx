import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, LocateFixed } from 'lucide-react'

declare global {
  interface Window {
    google?: any
    __googleMapsPromise?: Promise<void>
    __initGoogleMaps?: () => void
    gm_authFailure?: () => void
  }
}

interface GoogleMapPickerProps {
  apiKey?: string
  lat?: number | null
  lng?: number | null
  address?: string
  onLocationChange: (coords: { lat: number; lng: number }) => void
}

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 }

function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps?.Map) return Promise.resolve()
  if (window.__googleMapsPromise) return window.__googleMapsPromise

  window.__googleMapsPromise = new Promise((resolve, reject) => {
    const callbackName = '__initGoogleMaps'
    window[callbackName] = () => resolve()
    window.gm_authFailure = () => reject(new Error('Google Maps authentication failed'))

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error('Failed to load Google Maps script'))
    document.head.appendChild(script)
  })

  return window.__googleMapsPromise
}

export default function GoogleMapPicker({ apiKey, lat, lng, address, onLocationChange }: GoogleMapPickerProps) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [loading, setLoading] = useState(Boolean(apiKey))
  const [error, setError] = useState('')
  const [showIframeFallback, setShowIframeFallback] = useState(false)

  useEffect(() => {
    if (!apiKey || !mapRef.current) return

    let cancelled = false

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !mapRef.current) return

        if (!window.google?.maps?.Map) {
          throw new Error('Google Maps library did not initialize')
        }

        const center = lat && lng ? { lat, lng } : DEFAULT_CENTER
        const google = window.google

        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center,
          zoom: lat && lng ? 15 : 11,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#10111b' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#10111b' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1f2231' }] },
            { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#171926' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
          ],
        })

        markerRef.current = new google.maps.Marker({
          map: mapInstanceRef.current,
          position: center,
          draggable: true,
        })

        markerRef.current.addListener('dragend', (event: any) => {
          const next = { lat: event.latLng.lat(), lng: event.latLng.lng() }
          onLocationChange(next)
        })

        mapInstanceRef.current.addListener('click', (event: any) => {
          const next = { lat: event.latLng.lat(), lng: event.latLng.lng() }
          markerRef.current.setPosition(next)
          onLocationChange(next)
        })

        window.setTimeout(() => {
          google.maps.event.trigger(mapInstanceRef.current, 'resize')
          mapInstanceRef.current.setCenter(center)
        }, 180)

        window.setTimeout(() => {
          if (!mapRef.current?.querySelector('img, canvas')) {
            setShowIframeFallback(true)
          }
        }, 1200)

        setError('')
        setLoading(false)
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message || 'Unable to load Google Maps. Check your API key, billing, and allowed domains.')
          setShowIframeFallback(true)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [apiKey])

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !lat || !lng || !window.google?.maps) return
    const next = { lat, lng }
    mapInstanceRef.current.panTo(next)
    mapInstanceRef.current.setZoom(15)
    markerRef.current.setPosition(next)
    window.google.maps.event.trigger(mapInstanceRef.current, 'resize')
  }, [lat, lng])

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setError('')
        setShowIframeFallback(false)
        onLocationChange(next)
      },
      () => setError('Could not access your current location.'),
    )
  }

  if (!apiKey) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.03] p-4">
        <p className="text-[12px] font-medium text-slate-200">Add your Google Maps key to enable the location picker.</p>
        <p className="mt-1 text-[11px] text-slate-500">Set `VITE_GOOGLE_MAPS_API_KEY` in `frontend/.env` and restart Vite.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <MapPin size={12} />
          {lat && lng ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : address || 'Pick a location on the map'}
        </div>
        <button
          type="button"
          onClick={useCurrentLocation}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[11px] text-slate-300 transition-colors hover:bg-white/[0.06]"
        >
          <LocateFixed size={12} />
          Use Current Location
        </button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0d16]">
        {!showIframeFallback && <div ref={mapRef} className="h-64 w-full" />}
        {showIframeFallback && lat && lng && (
          <iframe
            title="Map preview"
            src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
            className="h-64 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
        {showIframeFallback && (!lat || !lng) && (
          <div className="flex h-64 items-center justify-center px-6 text-center text-[12px] text-slate-400">
            Set a location to preview the map.
          </div>
        )}
        {loading && <div className="absolute inset-0 flex items-center justify-center bg-[#0c0d16]/80 text-[12px] text-slate-400">Loading map...</div>}
        {!loading && error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0c0d16]/92 px-6 text-center">
            <div>
              <p className="text-[12px] font-medium text-amber-300">Map could not load</p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{error}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] text-amber-300">
          Check Google Cloud billing, referrer restrictions, and that `Maps JavaScript API` plus `Geocoding API` are enabled.
        </p>
      )}

      {showIframeFallback && !error && (
        <p className="text-[11px] text-slate-500">
          Showing fallback map preview. The address pinning still works even if the interactive Google map is blocked.
        </p>
      )}

      {lat && lng && (
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] text-indigo-300 hover:text-indigo-200"
        >
          <Navigation size={12} />
          Open in Google Maps
        </a>
      )}
    </div>
  )
}
