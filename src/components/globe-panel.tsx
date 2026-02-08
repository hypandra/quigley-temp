'use client'

import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import type { TimePeriod, Persona } from '@/lib/time-periods'

interface JourneyStop {
  period: TimePeriod
  persona: Persona
}

interface GlobePanelProps {
  journey: JourneyStop[]
  currentStop: JourneyStop
  onClose: () => void
  onJump: () => void
}

/** Interpolate N points along a great circle between two [lng, lat] points */
function greatCircleArc(from: [number, number], to: [number, number], steps = 50): [number, number][] {
  const toRad = (d: number) => (d * Math.PI) / 180
  const toDeg = (r: number) => (r * 180) / Math.PI

  const [lng1, lat1] = from.map(toRad)
  const [lng2, lat2] = to.map(toRad)

  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((lat2 - lat1) / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2
  ))

  if (d < 1e-6) return [from, to]

  const points: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const f = i / steps
    const a = Math.sin((1 - f) * d) / Math.sin(d)
    const b = Math.sin(f * d) / Math.sin(d)
    const x = a * Math.cos(lat1) * Math.cos(lng1) + b * Math.cos(lat2) * Math.cos(lng2)
    const y = a * Math.cos(lat1) * Math.sin(lng1) + b * Math.cos(lat2) * Math.sin(lng2)
    const z = a * Math.sin(lat1) + b * Math.sin(lat2)
    points.push([toDeg(Math.atan2(y, x)), toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)))])
  }
  return points
}

export default function GlobePanel({ journey, currentStop, onClose, onJump }: GlobePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const spinFrameRef = useRef<number>(0)
  const userInteractingRef = useRef(false)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const popupRef = useRef<maplibregl.Popup | null>(null)

  const startSpin = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    const spin = () => {
      if (!mapRef.current) return
      if (!userInteractingRef.current && mapRef.current.getZoom() <= 3) {
        const center = mapRef.current.getCenter()
        mapRef.current.setCenter([center.lng + 0.15, center.lat])
      }
      spinFrameRef.current = requestAnimationFrame(spin)
    }
    spinFrameRef.current = requestAnimationFrame(spin)
  }, [])

  const pauseSpin = useCallback(() => {
    userInteractingRef.current = true
    clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => {
      userInteractingRef.current = false
    }, 3000)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#0c1425' },
          },
        ],
      },
      center: [20, 20],
      zoom: 1.2,
      attributionControl: false,
    })

    mapRef.current = map

    map.on('load', () => {
      map.setProjection({ type: 'globe' })

      // Land layer
      map.addSource('land', {
        type: 'geojson',
        data: '/data/land.geojson',
      })
      map.addLayer({
        id: 'land-fill',
        type: 'fill',
        source: 'land',
        paint: {
          'fill-color': '#1a2744',
          'fill-opacity': 0.8,
        },
      })
      map.addLayer({
        id: 'land-outline',
        type: 'line',
        source: 'land',
        paint: {
          'line-color': '#2a3a5c',
          'line-width': 0.5,
        },
      })

      // Journey arcs
      const arcs: GeoJSON.Feature[] = []
      for (let i = 0; i < journey.length - 1; i++) {
        const from = journey[i].period.coordinates
        const to = journey[i + 1].period.coordinates
        arcs.push({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: greatCircleArc(from, to),
          },
        })
      }

      map.addSource('journey-arcs', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: arcs },
      })
      map.addLayer({
        id: 'journey-arcs',
        type: 'line',
        source: 'journey-arcs',
        paint: {
          'line-color': 'rgba(255, 255, 255, 0.3)',
          'line-width': 1.5,
          'line-dasharray': [4, 4],
        },
      })

      // Journey points
      const points: GeoJSON.Feature[] = journey.map((stop) => ({
        type: 'Feature',
        properties: {
          id: stop.period.id,
          era: stop.period.era,
          yearLabel: stop.period.yearLabel,
          color: stop.period.color,
          isCurrent: stop.period.id === currentStop.period.id,
        },
        geometry: {
          type: 'Point',
          coordinates: stop.period.coordinates,
        },
      }))

      map.addSource('journey-points', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: points },
      })

      // Outer glow for current location
      map.addLayer({
        id: 'journey-points-glow',
        type: 'circle',
        source: 'journey-points',
        filter: ['==', ['get', 'isCurrent'], true],
        paint: {
          'circle-radius': 14,
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.25,
          'circle-blur': 0.8,
        },
      })

      // Main circles
      map.addLayer({
        id: 'journey-points-circle',
        type: 'circle',
        source: 'journey-points',
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'isCurrent'], true], 8,
            6,
          ],
          'circle-color': ['get', 'color'],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      })

      // Click handler for markers
      map.on('click', 'journey-points-circle', (e) => {
        const feature = e.features?.[0]
        if (!feature || feature.geometry.type !== 'Point') return

        pauseSpin()

        popupRef.current?.remove()
        popupRef.current = new maplibregl.Popup({
          closeButton: false,
          className: 'globe-popup',
          offset: 12,
        })
          .setLngLat(feature.geometry.coordinates as [number, number])
          .setHTML(
            `<div style="padding:4px 8px;font-size:13px;line-height:1.4;color:#e8e6e3">` +
            `<strong style="color:${feature.properties.color}">${feature.properties.era}</strong><br/>` +
            `<span style="font-size:11px;opacity:0.7">${feature.properties.yearLabel}</span>` +
            `</div>`
          )
          .addTo(map)
      })

      map.on('mouseenter', 'journey-points-circle', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'journey-points-circle', () => {
        map.getCanvas().style.cursor = ''
      })

      // Fly to fit all journey points
      if (journey.length > 0) {
        const bounds = new maplibregl.LngLatBounds()
        journey.forEach(stop => bounds.extend(stop.period.coordinates))
        map.fitBounds(bounds, { padding: 60, maxZoom: 4, duration: 1500 })
      }

      startSpin()
    })

    // Pause spin on interaction
    map.on('mousedown', pauseSpin)
    map.on('touchstart', pauseSpin)
    map.on('wheel', pauseSpin)

    return () => {
      cancelAnimationFrame(spinFrameRef.current)
      clearTimeout(resumeTimerRef.current)
      popupRef.current?.remove()
      map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="absolute inset-0 z-50 bg-background flex flex-col">
      <div className="shrink-0 border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Globe</h3>
          <p className="text-xs text-muted-foreground">
            {journey.length} {journey.length === 1 ? 'stop' : 'stops'} across the world
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onJump}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Jump ⚡
          </button>
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            Back to Chat
          </button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1" />
    </div>
  )
}
