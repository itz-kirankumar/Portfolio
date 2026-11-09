'use client'

import React, { useState, useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react'

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

function dateStrOf(d: Date) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('-')
}

function gmtLabel() {
  const offsetMin = -new Date().getTimezoneOffset()
  const sign = offsetMin >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMin)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'local time'
  return `(GMT${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''}) ${tz}`
}

export function SlotPicker({ service, availability, upcomingBookings }: { service: any, availability: any, upcomingBookings: any[] }) {
  const [mounted, setMounted] = useState(false)
  const [selectedDateStr, setSelectedDateStr] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const dateRowRef = useRef<HTMLDivElement>(null)

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
      
      const dateStr = dateStrOf(d)

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
    return availableDates.find(d => dateStrOf(d) === selectedDateStr)
  }, [selectedDateStr, availableDates])

  const availableSlots = useMemo(() => {
    if (!selectedDate) return []
    const now = new Date()
    const leadTimeMs = availability.leadTimeHours * 3600000
    
    const dStr = dateStrOf(selectedDate)
    
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

  const scrollDates = (dir: number) => {
    dateRowRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' })
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-[76px] bg-paper-deep rounded-xl animate-pulse border border-rule"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form values for the server action. Invisible-but-validatable text
          inputs (the established pattern here) so native required validation
          blocks submission until a date and slot are picked. */}
      <input type="text" name="date" value={selectedDateStr} readOnly required
        className="absolute left-0 top-0 opacity-0 w-1 h-1 -z-10" tabIndex={-1} aria-hidden="true" />
      <input type="text" name="time" value={selectedTime} readOnly required
        className="absolute left-0 top-0 opacity-0 w-1 h-1 -z-10" tabIndex={-1} aria-hidden="true" />

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-sm font-medium text-ink">When should we meet?</span>
          <div className="flex gap-1">
            <button type="button" onClick={() => scrollDates(-1)} aria-label="Earlier dates"
              className="rounded-full border border-rule bg-paper p-1 text-ink-soft transition hover:border-coral hover:text-coral">
              <ChevronLeft className="size-3.5" />
            </button>
            <button type="button" onClick={() => scrollDates(1)} aria-label="Later dates"
              className="rounded-full border border-rule bg-paper p-1 text-ink-soft transition hover:border-coral hover:text-coral">
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
        <div ref={dateRowRef} className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {availableDates.map(d => {
            const val = dateStrOf(d)
            const isSelected = selectedDateStr === val
            return (
              <button
                key={val}
                type="button"
                onClick={() => { setSelectedDateStr(val); setSelectedTime('') }}
                className={`shrink-0 rounded-lg border px-3.5 py-2 text-center transition-colors ${
                  isSelected
                    ? 'border-coral bg-coral-soft text-coral-ink'
                    : 'border-rule bg-paper text-ink hover:border-coral'
                }`}
              >
                <span className="block text-[0.7rem] font-medium">
                  {d.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={`block text-[0.7rem] ${isSelected ? 'text-coral-ink' : 'text-ink-soft'}`}>
                  {d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {selectedDateStr && (
        <div>
          <span className="block text-sm font-medium text-ink mb-2.5">Select time of day</span>
          {availableSlots.length > 0 ? (
            <div className="flex flex-wrap gap-2">
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
                    className={`rounded-lg border px-3.5 py-2 text-sm font-mono transition-colors ${
                      isSelected 
                        ? 'border-coral bg-coral-soft text-coral-ink' 
                        : 'border-rule bg-paper text-ink hover:border-coral'
                    }`}
                  >
                    {slot.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-sm text-ink-soft py-3 px-4 bg-paper-deep rounded-lg border border-rule">
              No available slots on this date.
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-[0.8rem] text-ink-soft">
        <Globe className="size-3.5 shrink-0" />
        <span>{gmtLabel()} - times shown in your timezone</span>
      </div>
    </div>
  )
}
