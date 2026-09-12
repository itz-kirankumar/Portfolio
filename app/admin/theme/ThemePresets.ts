import { ThemeToken, DARK_PRESET } from '@/lib/schemas/theme'

export type ThemePreset = {
  id: string
  name: string
  palette: Partial<Record<ThemeToken, string>>
}

export const LIGHT_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    name: 'Paper (Default)',
    palette: {},
  },
  {
    id: 'minimal',
    name: 'Minimal Gray',
    palette: {
      paper: '#f8f9fa',
      'paper-deep': '#e9ecef',
      card: '#ffffff',
      ink: '#212529',
      'ink-soft': '#6c757d',
      rule: '#dee2e6',
      coral: '#3b82f6',
      'coral-deep': '#2563eb',
      'coral-ink': '#1d4ed8',
      'coral-soft': '#eff6ff',
    },
  },
  {
    id: 'warm',
    name: 'Warm Sunset',
    palette: {
      paper: '#fff8f0',
      'paper-deep': '#fce8d5',
      card: '#ffffff',
      ink: '#4a3b32',
      'ink-soft': '#8b7355',
      rule: '#e6d5c3',
      coral: '#d97757',
      'coral-deep': '#c55f40',
      'coral-ink': '#963f25',
      'coral-soft': '#fcf0ed',
    },
  },
  {
    id: 'custom',
    name: 'Custom',
    palette: {}, // this triggers the custom UI
  },
]

export const DARK_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    name: 'Warm Dark (Default)',
    palette: DARK_PRESET,
  },
  {
    id: 'onyx',
    name: 'Onyx Black',
    palette: {
      paper: '#09090b',
      'paper-deep': '#000000',
      card: '#18181b',
      ink: '#fafafa',
      'ink-soft': '#a1a1aa',
      rule: '#27272a',
      coral: '#3b82f6',
      'coral-deep': '#60a5fa',
      'coral-ink': '#93c5fd',
      'coral-soft': '#172554',
      'slate-deep': '#000000',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    palette: {
      paper: '#0f172a',
      'paper-deep': '#020617',
      card: '#1e293b',
      ink: '#f8fafc',
      'ink-soft': '#94a3b8',
      rule: '#334155',
      coral: '#38bdf8',
      'coral-deep': '#7dd3fc',
      'coral-ink': '#bae6fd',
      'coral-soft': '#0c4a6e',
      'slate-deep': '#020617',
    },
  },
  {
    id: 'custom',
    name: 'Custom',
    palette: {},
  },
]