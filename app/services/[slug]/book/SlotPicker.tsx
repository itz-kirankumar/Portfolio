'use client'

import React, { useState, useMemo } from 'react'

const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function addMinutes(date: Date, mins: number) {
  return new Date(date.getTime() + mins * 60000)
}

function parseTime(timeStr: string, baseDate: Date) {
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date(baseDate)
  d.setHours(h, m, 0, 0)
  return d
}

export function SlotPicker({ service, availability, upcomingBookings }: { service: any, availability: any, upcomingBookings: any[] }) {
  const [mounted, setMounted] = useState(false)
  const [selectedDateStr, setSelectedDateStr] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Generate available dates based on horizonDays and leadTime
  const availableDates = useMemo(() => {
    if (!mounted) return []
    const dates = []
    
    // We'll generate the next horizonDays
    for (let i = 0; i <= availability.horizonDays; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      d.setHours(0, 0, 0, 0)
      
      const dateStr = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0')
      ].join('-')

      const override = availability.dateOverrides?.[dateStr]

      if (override) {
        if (override.ranges && override.ranges.length > 0) {
          dates.push(d)
        }
        continue
      }

      const dayName = DAY_NAMES[d.getDay()]
      const rules = availability.weekly[dayName]
      
      if (rules?.enabled && rules?.ranges?.length > 0) {
        dates.push(d)
      }
    }
    return dates
  }, [availability, mounted])

  const selectedDate = useMemo(() => {
    if (!selectedDateStr) return null
    return availableDates.find(d => {
      const dStr = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0')
      ].join('-')
      return dStr === selectedDateStr
    })
  }, [selectedDateStr, availableDates])

  const availableSlots = useMemo(() => {
    if (!selectedDate) return []
    const now = new Date()
    const leadTimeMs = availability.leadTimeHours * 3600000
    
    const dStr = [
      selectedDate.getFullYear(),
      String(selectedDate.getMonth() + 1).padStart(2, '0'),
      String(selectedDate.getDate()).padStart(2, '0')
    ].join('-')
    
    const override = availability.dateOverrides?.[dStr]
    
    let ranges = []
    if (override) {
      ranges = override.ranges || []
    } else {
      const dayName = DAY_NAMES[selectedDate.getDay()]
      const rules = availability.weekly[dayName]
      if (rules?.enabled) {
        ranges = rules.ranges || []
      }
    }

    if (ranges.length === 0) return []

    const slots: Date[] = []
    const step = availability.slotStepMins
    const duration = service.durationMins

    for (const range of ranges) {
      let current = parseTime(range.start, selectedDate)
      const end = parseTime(range.end, selectedDate)

      while (addMinutes(current, duration) <= end) {
        // Check lead time
        if (current.getTime() - now.getTime() > leadTimeMs) {
          // Check overlap
          const slotStart = current.getTime()
          const slotEnd = slotStart + (duration + (service.bufferMins || 0)) * 60000
          
          const hasOverlap = upcomingBookings.some(b => {
            return (slotStart < b.end && slotEnd > b.start)
          })

          if (!hasOverlap) {
            slots.push(new Date(current))
          }
        }
        current = addMinutes(current, step)
      }
    }
    return slots
  }, [selectedDate, availability, service, upcomingBookings, mounted])

  if (!mounted) {
    return (
      <div className="space-y-6 border-t border-rule pt-6 mt-6">
        <div className="h-[70px] bg-paper-deep rounded-md animate-pulse border border-rule"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 border-t border-rule pt-6 mt-6">
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Select Date <span className="text-coral">*</span>
        </label>
        <select
          required
          name="date"
          value={selectedDateStr}
          onChange={e => {
            setSelectedDateStr(e.target.value)
            setSelectedTime('')
          }}
          className="w-full rounded-md border border-rule bg-paper px-4 py-2 text-ink shadow-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
        >
          <option value="" disabled>Select a date...</option>
          {availableDates.map(d => {
            const val = [
              d.getFullYear(),
              String(d.getMonth() + 1).padStart(2, '0'),
              String(d.getDate()).padStart(2, '0')
            ].join('-')
            return (
              <option key={val} value={val}>
                {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </option>
            )
          })}
        </select>
      </div>

      {selectedDateStr && (
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5 relative">
            Select Time <span className="text-coral">*</span>
            <input 
              type="text" 
              name="time" 
              value={selectedTime} 
              readOnly
              required 
              className="absolute left-0 top-0 opacity-0 w-1 h-1 -z-10"
              tabIndex={-1}
            />
          </label>
          {availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {availableSlots.map(slot => {
                const timeStr = [
                  String(slot.getHours()).padStart(2, '0'),
                  String(slot.getMinutes()).padStart(2, '0')
                ].join(':')
                
                const isSelected = selectedTime === timeStr
                
                return (
                  <button
                    key={timeStr}
                    type="button"
                    onClick={() => setSelectedTime(timeStr)}
                    className={`py-2 px-3 text-sm font-mono rounded-md border text-center transition-colors ${
                      isSelected 
                        ? 'bg-coral-soft border-coral text-coral-ink' 
                        : 'bg-paper border-rule text-ink hover:border-coral hover:text-coral'
                    }`}
                  >
                    {slot.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-sm text-ink-soft py-4 px-4 bg-paper-deep rounded-md border border-rule">
              No available slots on this date.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
