'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AnimalLog } from '@/types'

interface Props {
  animalId: string
  logType: AnimalLog['log_type']
  onClose: () => void
  onSave: () => void
}

const logLabels: Record<AnimalLog['log_type'], string> = {
  feeding: '🍖 Besleme Kaydı',
  health: '🏥 Sağlık Kaydı',
  vaccination: '💉 Aşı Kaydı',
  sighting: '👁️ Görülme Kaydı',
  note: '📝 Not',
}

export default function LogModal({ animalId, logType, onClose, onSave }: Props) {
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await supabase.from('animal_logs').insert({
      animal_id: animalId,
      log_type: logType,
      notes: notes.trim(),
    })
    setSaving(false)
    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-bold text-gray-800">{logLabels[logType]}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-4 space-y-4">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notlar (opsiyonel)..."
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-orange-500 text-white py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}
