'use client'

import { useState } from 'react'
import { Animal, AnimalLog } from '@/types'
import { supabase } from '@/lib/supabase'
import LogModal from './LogModal'

interface AnimalCardProps {
  animal: Animal
}

const healthLabels = {
  healthy: { label: 'Sağlıklı', cls: 'bg-green-100 text-green-700' },
  sick: { label: 'Hasta', cls: 'bg-red-100 text-red-700' },
  injured: { label: 'Yaralı', cls: 'bg-yellow-100 text-yellow-700' },
  unknown: { label: 'Bilinmiyor', cls: 'bg-gray-100 text-gray-600' },
}

export default function AnimalCard({ animal }: AnimalCardProps) {
  const [logs, setLogs] = useState<AnimalLog[]>([])
  const [showLogs, setShowLogs] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)
  const [logType, setLogType] = useState<AnimalLog['log_type']>('feeding')

  async function fetchLogs() {
    const { data } = await supabase
      .from('animal_logs')
      .select('*')
      .eq('animal_id', animal.id)
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setLogs(data)
  }

  function toggleLogs() {
    if (!showLogs) fetchLogs()
    setShowLogs(!showLogs)
  }

  function openLog(type: AnimalLog['log_type']) {
    setLogType(type)
    setShowLogModal(true)
  }

  const health = healthLabels[animal.health_status]

  const logTypeLabels: Record<AnimalLog['log_type'], string> = {
    feeding: '🍖 Besleme',
    health: '🏥 Sağlık',
    vaccination: '💉 Aşı',
    sighting: '👁️ Görüldü',
    note: '📝 Not',
  }

  return (
    <div className="min-w-[260px]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          {animal.photo_url ? (
            <img src={animal.photo_url} alt={animal.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">
              {animal.type === 'cat' ? '🐱' : '🐶'}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">{animal.name}</h3>
          <p className="text-sm text-gray-500">{animal.color}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${health.cls}`}>
          {health.label}
        </span>
        {animal.is_vaccinated && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Aşılı ✓</span>
        )}
        {animal.is_neutered && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">Kısırlaştırıldı ✓</span>
        )}
      </div>

      {animal.description && (
        <p className="text-sm text-gray-600 mb-3">{animal.description}</p>
      )}

      <div className="grid grid-cols-3 gap-1 mb-3">
        {(['feeding', 'health', 'vaccination'] as const).map(type => (
          <button
            key={type}
            onClick={() => openLog(type)}
            className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 py-1.5 px-1 rounded-lg transition-colors text-center"
          >
            {logTypeLabels[type]}
          </button>
        ))}
      </div>

      <button
        onClick={toggleLogs}
        className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
      >
        {showLogs ? '▲ Kayıtları gizle' : '▼ Geçmiş kayıtları gör'}
      </button>

      {showLogs && (
        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">Henüz kayıt yok</p>
          ) : (
            logs.map(log => (
              <div key={log.id} className="text-xs bg-gray-50 rounded p-2">
                <span className="font-medium">{logTypeLabels[log.log_type]}</span>
                {log.notes && <span className="text-gray-500"> — {log.notes}</span>}
                <p className="text-gray-400 mt-0.5">
                  {new Date(log.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {showLogModal && (
        <LogModal
          animalId={animal.id}
          logType={logType}
          onClose={() => setShowLogModal(false)}
          onSave={() => {
            setShowLogModal(false)
            fetchLogs()
            if (!showLogs) setShowLogs(true)
          }}
        />
      )}
    </div>
  )
}
