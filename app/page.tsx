'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Animal } from '@/types'
import AddAnimalModal from '@/components/AddAnimalModal'

const Map = dynamic(() => import('@/components/Map'), { ssr: false })

export default function Home() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)
  const [filter, setFilter] = useState<'all' | 'cat' | 'dog'>('all')

  useEffect(() => {
    fetchAnimals()
  }, [])

  async function fetchAnimals() {
    const { data } = await supabase
      .from('animals')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setAnimals(data)
  }

  const filtered = filter === 'all' ? animals : animals.filter(a => a.type === filter)

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Sol panel */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex gap-2 mb-3">
            {(['all', 'cat', 'dog'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Tümü' : f === 'cat' ? '🐱 Kedi' : '🐶 Köpek'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            + Hayvan Ekle
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 mt-8 text-sm">Henüz hayvan eklenmemiş</p>
          ) : (
            filtered.map(animal => (
              <div
                key={animal.id}
                onClick={() => setSelectedAnimal(animal)}
                className={`p-3 border-b cursor-pointer hover:bg-orange-50 transition-colors ${
                  selectedAnimal?.id === animal.id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {animal.photo_url ? (
                      <img src={animal.photo_url} alt={animal.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {animal.type === 'cat' ? '🐱' : '🐶'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{animal.name}</p>
                    <p className="text-xs text-gray-500">{animal.color}</p>
                    <div className="flex gap-1 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        animal.health_status === 'healthy' ? 'bg-green-100 text-green-700' :
                        animal.health_status === 'sick' ? 'bg-red-100 text-red-700' :
                        animal.health_status === 'injured' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {animal.health_status === 'healthy' ? 'Sağlıklı' :
                         animal.health_status === 'sick' ? 'Hasta' :
                         animal.health_status === 'injured' ? 'Yaralı' : 'Bilinmiyor'}
                      </span>
                      {animal.is_vaccinated && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Aşılı</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Harita */}
      <div className="flex-1">
        <Map animals={filtered} selectedAnimal={selectedAnimal} onSelectAnimal={setSelectedAnimal} />
      </div>

      {showModal && (
        <AddAnimalModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            fetchAnimals()
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}
