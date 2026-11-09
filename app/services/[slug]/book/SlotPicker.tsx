'use client'

import React, { useState, useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react'
import { generateSlotsByVisitorDate } from '@/lib/slots'

/**
 * Availability ranges are owner wall-clock ("18:00" in availability.tz, e.g.
 * Asia/Kolkata). Visitors can be anywhere, so every slot is an absolute
 * instant (see lib/slots.ts). Chips group by the VISITOR's local date and
 * times render visitor-local, so a 21:00 IST slot correctly lands on the
 * next day for a visitor ahead of IST. What is submitted is the instant
 * itself (epoch ms) - wall-time strings would be re-parsed in yet another
 * timezone on the server.
 */

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
  const [selectedStartMs, setSelectedStartMs] = useState(0)
  const dateRowRef = useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // All bookable slots across the horizon, grouped by visitor-local date.
  const slotsByDate = useMemo(
    () => (mounted ? generateSlotsByVisitorDate(availability, service, upcomingBookings, Date.now()) : new Map()),
    [mounted, availability, service, upcomingBookings]
  )

  const availableDates = useMemo(() => [...slotsByDate.keys()].sort(), [slotsByDate])
  const availableSlots = useMemo(
    () => (selectedDateStr ? slotsByDate.get(selectedDateStr) ?? [] : []),
    [slotsByDate, selectedDateStr]
  )

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
      {/* The booking is the instant, not a wall-time string. Invisible but
          natively validated so submission blocks until a slot is picked. */}
      <input type="text" name="startMs" value={selectedStartMs ? String(selectedStartMs) : ''} readOnly required
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
          {availableDates.map(val => {
            const d = new Date(val + 'T12:00:00')
            const isSelected = selectedDateStr === val
            return (
              <button
                key={val}
                type="button"
                onClick={() => { setSelectedDateStr(val); setSelectedStartMs(0) }}
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
          {availableDates.length === 0 && (
            <p className="text-sm text-ink-soft py-2">No open dates in the next {availability.horizonDays} days.</p>
          )}
        </div>
      </div>

      {selectedDateStr && (
        <div>
          <span className="block text-sm font-medium text-ink mb-2.5">Select time of day</span>
          {availableSlots.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableSlots.map(slot => {
                const isSelected = selectedStartMs === slot.startMs
                return (
                  <button
                    key={slot.startMs}
                    type="button"
                    onClick={() => setSelectedStartMs(slot.startMs)}
                    className={`rounded-lg border px-3.5 py-2 text-sm font-mono transition-colors ${
                      isSelected 
                        ? 'border-coral bg-coral-soft text-coral-ink' 
                        : 'border-rule bg-paper text-ink hover:border-coral'
                    }`}
                  >
                    {new Date(slot.startMs).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
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
