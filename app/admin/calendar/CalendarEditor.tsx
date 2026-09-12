'use client'
import { useUI as useToast } from '@/lib/store/ui'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveAvailability } from './actions'
import { DAY_LABELS, DAY_KEYS, type DayKey } from '@/lib/schemas/availability'
import { Panel, Field, Input, Toggle, SaveBar } from '@/components/admin/ui'

export default function CalendarEditor({ initialData, serviceAccountEmail }: { initialData: any, serviceAccountEmail: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  
  const [data, setData] = useState(initialData)

  const updateDay = (day: DayKey, patch: any) => {
    setData((prev: any) => ({
      ...prev,
      weekly: {
        ...prev.weekly,
        [day]: { ...prev.weekly[day], ...patch }
      }
    }))
    setDirty(true)
  }

  const updateField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }))
    setDirty(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await saveAvailability(data)
      if (res.ok === false) {
        alert(res.error + (res.issues ? '\n' + res.issues.join('\n') : ''))
      } else {
        useToast.getState().toast('Availability saved!')
        setDirty(false)
        setSavedAt(Date.now())
        router.refresh()
      }
    } catch (e: any) {
      alert('Error saving: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-32 space-y-8">
      {/* Google Calendar Sync */}
      <Panel title="Google Calendar Sync">
        <div className="space-y-4">
          <p className="text-[0.85rem] text-ink-soft">
            Prevent double-booking by syncing directly with your Google Calendar. 
            When someone tries to book a slot, we will check your calendar and block off times you are already busy.
          </p>
          
          {data.googleRefreshToken ? (
            <div className="bg-coral-soft/20 text-coral-ink p-4 rounded-md border border-coral-soft flex items-start gap-3">
              <span className="text-lg">✓</span>
              <div>
                <strong className="block text-sm">Automated Sync Active!</strong>
                <span className="text-[0.82rem] opacity-90">
                  Your Google account is securely connected. We are automatically checking <strong>all</strong> your subscribed calendars and classes to prevent double-booking.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-paper-deep p-4 rounded-md border border-rule space-y-3">
              <h4 className="text-[0.85rem] font-semibold text-ink">Sync ALL your calendars automatically:</h4>
              <p className="text-[0.82rem] text-ink-soft">
                The easiest way to sync <strong>all</strong> your university classes, holidays, and shared calendars is to simply log out of this admin panel and log back in. 
                Google will ask for permission to read your calendars, and we will automatically handle the rest!
              </p>
              <div className="pt-2">
                <a href="/api/auth/signout" className="inline-block text-xs font-medium bg-paper border border-rule px-3 py-1.5 rounded hover:border-coral transition">
                  Log out & Re-authenticate
                </a>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-rule mt-6">
            <h4 className="text-[0.85rem] font-medium text-ink mb-2">Manual Fallback (Service Account)</h4>
            <p className="text-[0.8rem] text-ink-soft mb-4">
              If you prefer not to grant account-wide access, you can manually share specific calendars with <code className="bg-paper-deep px-1 rounded">{serviceAccountEmail}</code> and enter their IDs below.
            </p>
            <Field label="Your Google Calendar IDs (Comma separated for multiple)">
              <Input 
                value={data.googleCalendarId || ''} 
                onChange={e => updateField('googleCalendarId', e.target.value)}
                placeholder="e.g. you@gmail.com, work@company.com"
              />
            </Field>
          </div>
        </div>
      </Panel>

      {/* Weekly Hours */}
      <Panel title="Weekly Hours" description="Set your default availability for each day of the week.">
        <div className="divide-y divide-rule border border-rule rounded-md overflow-hidden">
          {DAY_KEYS.map((day) => {
            const dayData = data.weekly[day] || { enabled: false, ranges: [] }
            
            // For simplicity, we just use the first range if enabled. 
            // If they had multiple ranges from the autoform, we preserve them in state but only show editing for the first one to keep it Calendly-simple.
            // If none exists, default to 09:00 - 17:00
            const range = dayData.ranges?.[0] || { start: '09:00', end: '17:00' }

            return (
              <div key={day} className="flex items-center justify-between p-4 bg-paper hover:bg-paper-deep/50 transition">
                <div className="flex items-center gap-4 w-1/3">
                  <Toggle 
                    label=""
                    checked={dayData.enabled} 
                    onChange={v => {
                      if (v && dayData.ranges.length === 0) {
                        updateDay(day, { enabled: true, ranges: [{ start: '09:00', end: '17:00' }] })
                      } else {
                        updateDay(day, { enabled: v })
                      }
                    }} 
                  />
                  <span className="font-medium text-[0.9rem] text-ink w-24">
                    {DAY_LABELS[day]}
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-1 justify-end">
                  {dayData.enabled ? (
                    <>
                      <input 
                        type="time" 
                        value={range.start}
                        onChange={e => {
                          const newRanges = [...dayData.ranges]
                          newRanges[0] = { ...range, start: e.target.value }
                          updateDay(day, { ranges: newRanges })
                        }}
                        className="rounded-md border border-rule bg-paper px-3 py-1.5 text-sm focus:border-coral focus:ring-1 focus:ring-coral"
                      />
                      <span className="text-ink-soft text-sm">to</span>
                      <input 
                        type="time" 
                        value={range.end}
                        onChange={e => {
                          const newRanges = [...dayData.ranges]
                          newRanges[0] = { ...range, end: e.target.value }
                          updateDay(day, { ranges: newRanges })
                        }}
                        className="rounded-md border border-rule bg-paper px-3 py-1.5 text-sm focus:border-coral focus:ring-1 focus:ring-coral"
                      />
                    </>
                  ) : (
                    <span className="text-[0.85rem] text-ink-soft italic py-1.5 px-3">Unavailable</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      {/* Booking Rules */}
      <Panel title="Booking Rules" description="Fine-tune how your calendar behaves.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field label="Minimum Notice (Hours)" help="Prevent ambush bookings.">
            <Input 
              type="number" 
              min={0}
              value={data.leadTimeHours} 
              onChange={e => updateField('leadTimeHours', parseInt(e.target.value) || 0)}
            />
          </Field>
          
          <Field label="Future Horizon (Days)" help="How far out can clients book?">
            <Input 
              type="number"
              min={1} 
              value={data.horizonDays} 
              onChange={e => updateField('horizonDays', parseInt(e.target.value) || 1)}
            />
          </Field>

          <Field label="Slot Intervals (Mins)" help="Frequency of start times.">
            <Input 
              type="number" 
              min={5}
              value={data.slotStepMins} 
              onChange={e => updateField('slotStepMins', parseInt(e.target.value) || 5)}
            />
          </Field>
        </div>
      </Panel>

      <SaveBar
        dirty={dirty}
        saving={loading}
        onSave={handleSave}
        savedAt={savedAt}
      />
    </div>
  )
}
