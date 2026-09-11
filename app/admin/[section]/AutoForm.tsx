"use client"
import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

// Helper to get default value for a zod schema
function getDefaultValue(schema: any): any {
  if (!schema || !schema._def) return ''
  const typeName = schema._def.typeName || schema._def.type
  if (typeName === 'ZodDefault' || typeName === 'default') {
    return typeof schema._def.defaultValue === 'function' ? schema._def.defaultValue() : schema._def.defaultValue;
  }
  if (typeName === 'ZodOptional' || typeName === 'optional' || typeName === 'ZodNullable' || typeName === 'nullable') return null
  if (typeName === 'ZodString' || typeName === 'string') return ''
  if (typeName === 'ZodNumber' || typeName === 'number') return 0
  if (typeName === 'ZodBoolean' || typeName === 'boolean') return false
  if (typeName === 'ZodEnum' || typeName === 'enum') {
    const vals = schema._def.values || Object.keys(schema._def.entries || {})
    return vals[0]
  }
  if (typeName === 'ZodArray' || typeName === 'array') return []
  if (typeName === 'ZodObject' || typeName === 'object') {
    const shape = typeof schema._def.shape === 'function' ? schema._def.shape() : schema._def.shape
    const obj: any = {}
    for (const key in shape) {
      obj[key] = getDefaultValue(shape[key])
    }
    return obj
  }
  if (typeName === 'ZodRecord' || typeName === 'record') return {}
  return ''
}

function FieldLabel({ label, required }: { label: string, required?: boolean }) {
  return (
    <label className={`${LABEL} mb-1.5`}>
      {label.replace(/([A-Z])/g, ' $1').trim()}
      {required && <span className="text-coral-ink ml-1">*</span>}
    </label>
  )
}

function AutoField({ schema, value, onChange, path }: { schema: any, value: any, onChange: (val: any) => void, path: string }) {
  if (!schema || !schema._def) return <div className="text-coral-ink text-[0.85rem]">Missing schema definition for {path}</div>
  
  const typeName = schema._def.typeName || schema._def.type

  if (typeName === 'ZodOptional' || typeName === 'optional' || typeName === 'ZodDefault' || typeName === 'default' || typeName === 'ZodNullable' || typeName === 'nullable') {
    return <AutoField schema={schema._def.innerType} value={value} onChange={onChange} path={path} />
  }

  if (typeName === 'ZodString' || typeName === 'string') {
    const isLongText = path.match(/body|intro|summary|blurb|quote|context/i)
    if (isLongText) {
      return <textarea 
        value={value || ''} 
        onChange={e => onChange(e.target.value)}
        className={`${INPUT} min-h-[100px] font-mono text-[0.8rem]`}
      />
    }
    const isTime = path.match(/\.start$|\.end$/i)
    if (isTime) {
      return <input 
        type="time" 
        value={value || ''} 
        onChange={e => onChange(e.target.value)}
        className={INPUT}
      />
    }
    return <input 
      type="text" 
      value={value || ''} 
      onChange={e => onChange(e.target.value)}
      className={INPUT}
    />
  }

  if (typeName === 'ZodBoolean' || typeName === 'boolean') {
    return (
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input 
          type="checkbox" 
          checked={!!value} 
          onChange={e => onChange(e.target.checked)}
          className="size-4 rounded border-rule text-coral-deep focus:ring-coral/20 bg-card"
        />
        <span className="text-[0.9rem] text-ink">Enabled</span>
      </label>
    )
  }

  if (typeName === 'ZodNumber' || typeName === 'number') {
    return <input 
      type="number" 
      value={value || 0} 
      onChange={e => onChange(parseFloat(e.target.value))}
      className={INPUT}
    />
  }

  if (typeName === 'ZodEnum' || typeName === 'enum') {
    const enumValues = schema._def.values || Object.keys(schema._def.entries || {})
    return (
      <select 
        value={value || enumValues[0]} 
        onChange={e => onChange(e.target.value)}
        className={`${INPUT} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.65em_auto] bg-[right_1em_center] bg-no-repeat`}
      >
        {enumValues.map((v: string) => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
    )
  }

  if (typeName === 'ZodObject' || typeName === 'object') {
    const shape = typeof schema._def.shape === 'function' ? schema._def.shape() : schema._def.shape
    return (
      <div className="flex flex-col gap-4 p-4 border border-rule rounded-lg bg-paper-deep/30">
        {Object.entries(shape).map(([key, childSchema]: [string, any]) => (
          <div key={key}>
            <FieldLabel label={key} />
            <AutoField 
              schema={childSchema} 
              value={value?.[key]} 
              onChange={newVal => onChange({ ...value, [key]: newVal })}
              path={`${path}.${key}`}
            />
          </div>
        ))}
      </div>
    )
  }

  if (typeName === 'ZodArray' || typeName === 'array') {
    const elementSchema = schema._def.element || schema._def.type
    const items = value || []
    
    return (
      <div className="flex flex-col gap-3">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="relative flex gap-3 p-4 border border-rule rounded-lg bg-card shadow-sm group">
            <div className="flex-1">
              <AutoField 
                schema={elementSchema} 
                value={item} 
                onChange={newVal => {
                  const newItems = [...items]
                  newItems[idx] = newVal
                  onChange(newItems)
                }}
                path={`${path}[${idx}]`}
              />
            </div>
            <button 
              onClick={() => {
                const newItems = items.filter((_: any, i: number) => i !== idx)
                onChange(newItems)
              }}
              className="text-ink-soft hover:text-coral-ink self-start p-1 mt-6 transition"
              title="Remove item"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            onChange([...items, getDefaultValue(elementSchema)])
          }}
          className={`${GHOST_BTN} w-fit mt-1 flex items-center gap-1.5`}
        >
          <Plus className="size-3.5" /> Add Item
        </button>
      </div>
    )
  }

  if (typeName === 'ZodRecord' || typeName === 'record') {
    const valueSchema = schema._def.valueType
    const keySchema = schema._def.keyType
    
    let keyOptions: string[] = []
    if (keySchema && (keySchema._def.typeName === 'ZodEnum' || keySchema._def.type === 'enum')) {
      keyOptions = keySchema._def.values || Object.keys(keySchema._def.entries || {})
    }

    const entries = Object.entries(value || {})

    return (
      <div className="flex flex-col gap-4 p-4 border border-rule rounded-lg bg-paper-deep/30">
        {entries.map(([k, v], idx) => (
          <div key={idx} className="flex gap-3 items-start">
            <div className="w-1/3">
              {keyOptions.length > 0 ? (
                <select 
                  value={k} 
                  onChange={e => {
                    const newObj = { ...value }
                    delete newObj[k]
                    newObj[e.target.value] = v
                    onChange(newObj)
                  }}
                  className={`${INPUT} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.65em_auto] bg-[right_1em_center] bg-no-repeat`}
                >
                  {keyOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type={path.includes('dateOverrides') ? 'date' : 'text'} 
                  value={k} 
                  onChange={e => {
                    const newObj = { ...value }
                    delete newObj[k]
                    if (e.target.value) newObj[e.target.value] = v
                    onChange(newObj)
                  }} 
                  className={INPUT} 
                  placeholder={path.includes('dateOverrides') ? "Select Date" : "Key"}
                />
              )}
            </div>
            <div className="flex-1">
              <AutoField 
                schema={valueSchema} 
                value={v} 
                onChange={newV => onChange({ ...value, [k]: newV })} 
                path={`${path}.${k}`} 
              />
            </div>
            <button 
              onClick={() => {
                const newObj = { ...value }
                delete newObj[k]
                onChange(newObj)
              }}
              className="text-ink-soft hover:text-coral-ink self-start p-2 mt-1 transition"
              title="Remove item"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            let newKey = ''
            if (keyOptions.length > 0) {
              newKey = keyOptions.find(opt => !(opt in (value || {}))) || keyOptions[0]
            }
            onChange({ ...(value || {}), [newKey]: getDefaultValue(valueSchema) })
          }}
          className={`${GHOST_BTN} w-fit mt-1 flex items-center gap-1.5`}
        >
          <Plus className="size-3.5" /> Add Item
        </button>
      </div>
    )
  }

  return <div className="text-coral-ink text-[0.85rem] py-2 px-3 bg-coral-soft/50 rounded border border-coral-ink/20">Unsupported type: {typeName}</div>
}

import { SaveBar, BTN_PRIMARY, BTN, INPUT, LABEL, GHOST_BTN } from '@/components/admin/ui'

export default function AutoForm({ schema, initialData, onSave, loading, error }: { schema: any, initialData: any, onSave: (data: any) => void, loading: boolean, error: string | null }) {
  const [data, setData] = useState(initialData)
  
  // Simple dirty check (stringified comparison)
  const isDirty = JSON.stringify(data) !== JSON.stringify(initialData)

  return (
    <div className="flex flex-col">
      <div className="rounded-xl border border-rule bg-card p-6 shadow-sm">
        <AutoField schema={schema} value={data} onChange={setData} path="root" />
      </div>

      <SaveBar
        dirty={isDirty}
        saving={loading}
        error={error}
        onSave={() => onSave(data)}
        onReset={() => setData(initialData)}
      />
    </div>
  )
}
