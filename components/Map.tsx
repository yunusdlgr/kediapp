'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Animal } from '@/types'
import AnimalCard from './AnimalCard'

const catIcon = L.divIcon({
  className: '',
  html: '<div style="font-size:28px;line-height:1;">🐱</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const dogIcon = L.divIcon({
  className: '',
  html: '<div style="font-size:28px;line-height:1;">🐶</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

function FlyTo({ animal }: { animal: Animal | null }) {
  const map = useMap()
  useEffect(() => {
    if (animal) map.flyTo([animal.lat, animal.lng], 17, { duration: 1 })
  }, [animal, map])
  return null
}

interface MapProps {
  animals: Animal[]
  selectedAnimal: Animal | null
  onSelectAnimal: (animal: Animal) => void
}

export default function Map({ animals, selectedAnimal, onSelectAnimal }: MapProps) {
  return (
    <MapContainer
      center={[41.015137, 28.979530]}
      zoom={13}
      className="w-full h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo animal={selectedAnimal} />
      {animals.map(animal => (
        <Marker
          key={animal.id}
          position={[animal.lat, animal.lng]}
          icon={animal.type === 'cat' ? catIcon : dogIcon}
          eventHandlers={{ click: () => onSelectAnimal(animal) }}
        >
          <Popup maxWidth={300}>
            <AnimalCard animal={animal} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
