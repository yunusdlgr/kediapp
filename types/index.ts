export type AnimalType = 'cat' | 'dog'

export type HealthStatus = 'healthy' | 'sick' | 'injured' | 'unknown'

export interface Animal {
  id: string
  name: string
  type: AnimalType
  color: string
  description: string
  photo_url: string | null
  lat: number
  lng: number
  health_status: HealthStatus
  is_vaccinated: boolean
  is_neutered: boolean
  created_at: string
  last_seen_at: string
}

export interface AnimalLog {
  id: string
  animal_id: string
  log_type: 'feeding' | 'health' | 'vaccination' | 'sighting' | 'note'
  notes: string
  created_at: string
  created_by: string | null
}
