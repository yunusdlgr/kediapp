'use client'

import { useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { supabase } from '@/lib/supabase'
import { AnimalType, HealthStatus } from '@/types'
import dynamic from 'next/dynamic'

function LocationPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  const [pos, setPos] = useState<[number, number] | null>(null)

  useMapEvents({
    click(e) {
      setPos([e.latlng.lat, e.latlng.lng])
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })

  return pos ? <Marker position={pos} /> : null
}

interface Props {
  onClose: () => void
  onSave: () => void
}

export default function AddAnimalModal({ onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [type, setType] = useState<AnimalType>('cat')
  const [color, setColor] = useState('')
  const [description, setDescription] = useState('')
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('unknown')
  const [isVaccinated, setIsVaccinated] = useState(false)
  const [isNeutered, setIsNeutered] = useState(false)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!name.trim()) return setError('İsim gerekli')
    if (!lat || !lng) return setError('Haritadan konum seçin')
    setSaving(true)

    let photo_url: string | null = null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('animal-photos').upload(path, photoFile)
      if (!uploadErr) {
        const { data } = supabase.storage.from('animal-photos').getPublicUrl(path)
        photo_url = data.publicUrl
      }
    }

    const { error: insertErr } = await supabase.from('animals').insert({
      name: name.trim(),
      type,
      color: color.trim(),
      description: description.trim(),
      health_status: healthStatus,
      is_vaccinated: isVaccinated,
      is_neutered: isNeutered,
      lat,
      lng,
      photo_url,
      last_seen_at: new Date().toISOString(),
    })

    setSaving(false)
    if (insertErr) return setError('Kaydedilemedi: ' + insertErr.message)
    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Yeni Hayvan Ekle</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Tür */}
          <div className="flex gap-3">
            {(['cat', 'dog'] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-3 rounded-xl text-lg font-medium transition-colors ${
                  type === t ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t === 'cat' ? '🐱 Kedi' : '🐶 Köpek'}
              </button>
            ))}
          </div>

          {/* Fotoğraf */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex items-center justify-center cursor-pointer hover:border-orange-300 transition-colors overflow-hidden"
          >
            {photoPreview ? (
              <img src={photoPreview} className="h-full w-full object-cover" alt="preview" />
            ) : (
              <p className="text-gray-400 text-sm">📷 Fotoğraf ekle (opsiyonel)</p>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

          {/* İsim & Renk */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">İsim *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Pamuk"
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Renk / Görünüm</label>
              <input
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder="Sarı-beyaz"
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Açıklama</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ek bilgiler..."
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none"
            />
          </div>

          {/* Sağlık durumu */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Sağlık Durumu</label>
            <div className="grid grid-cols-4 gap-2">
              {([['healthy', 'Sağlıklı'], ['sick', 'Hasta'], ['injured', 'Yaralı'], ['unknown', 'Bilinmiyor']] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setHealthStatus(val)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    healthStatus === val ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Aşı & Kısırlaştırma */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isVaccinated} onChange={e => setIsVaccinated(e.target.checked)} className="w-4 h-4 accent-orange-500" />
              <span className="text-sm text-gray-700">Aşılı</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isNeutered} onChange={e => setIsNeutered(e.target.checked)} className="w-4 h-4 accent-orange-500" />
              <span className="text-sm text-gray-700">Kısırlaştırıldı</span>
            </label>
          </div>

          {/* Konum */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Konum * {lat && lng ? <span className="text-green-600 font-medium">✓ Seçildi</span> : <span className="text-gray-400">(haritaya tıklayın)</span>}
            </label>
            <div className="h-48 rounded-xl overflow-hidden border">
              <MapContainer center={[41.015137, 28.979530]} zoom={12} className="w-full h-full">
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationPicker onPick={(la, ln) => { setLat(la); setLng(ln) }} />
              </MapContainer>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}
